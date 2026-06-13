// Logika billing Opsi A (manual-confirm) untuk ClaudProx.
//
// Inti: saat admin meng-confirm pembayaran, token user di-refill ke subscription
// "wallet" yang SAMA (API key tidak berubah). Operasi WAJIB atomik dan idempoten:
// payment yang sudah CONFIRMED tidak boleh memicu refill dua kali.

import { Prisma, type PrismaClient } from "@prisma/client";

/** Hasil konfirmasi pembayaran. */
export interface ConfirmPaymentResult {
  /** true bila pembayaran ini baru saja di-confirm dan refill diterapkan. */
  applied: boolean;
  /** Alasan bila tidak diterapkan (mis. sudah CONFIRMED atau bukan PENDING). */
  reason?: string;
  /** ID subscription yang menerima refill (bila applied). */
  subscriptionId?: string;
  /** ID baris refill yang dibuat (bila applied). */
  refillId?: string;
}

/** Tambahkan durasi hari ke tanggal dasar. */
function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Konfirmasi pembayaran PENDING dan refill token ke subscription wallet user.
 *
 * Idempoten: hanya memproses bila Payment masih PENDING. Bila sudah CONFIRMED
 * atau REJECTED, mengembalikan applied=false tanpa mengubah saldo.
 *
 * Atomik: seluruh perubahan (status payment, refill, subscription) dalam satu
 * transaksi. Bila gagal di tengah, tidak ada perubahan parsial.
 *
 * Model wallet: satu subscription ACTIVE per user. Bila belum ada, dibuat baru.
 * Bila sudah ada, token ditambah dan expiresAt diperpanjang (atau di-reset bila
 * sudah lewat).
 *
 * @param adminId ID admin yang meng-confirm (untuk audit; disimpan di note).
 */
export async function confirmPayment(
  prisma: PrismaClient,
  paymentId: string,
  adminId: string,
): Promise<ConfirmPaymentResult> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { plan: true },
    });

    if (payment === null) {
      return { applied: false, reason: "payment tidak ditemukan" };
    }
    if (payment.status !== "PENDING") {
      return { applied: false, reason: `payment sudah ${payment.status}` };
    }

    // Tandai payment CONFIRMED. Kondisi status=PENDING pada update mencegah
    // double-confirm bila ada request paralel (count=0 -> sudah diproses).
    const marked = await tx.payment.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        note: payment.note ?? `confirmed by ${adminId}`,
      },
    });
    if (marked.count === 0) {
      return { applied: false, reason: "payment sudah diproses paralel" };
    }

    const now = new Date();
    const quota = payment.plan.tokenQuota;
    const days = payment.plan.durationDays;

    // Ambil subscription wallet aktif user (paling baru bila ada lebih dari satu).
    const existing = await tx.subscription.findFirst({
      where: { userId: payment.userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    let subscriptionId: string;
    if (existing === null) {
      const created = await tx.subscription.create({
        data: {
          userId: payment.userId,
          planId: payment.planId,
          status: "ACTIVE",
          tokensTotal: quota,
          tokensRemaining: quota,
          startedAt: now,
          expiresAt: addDays(now, days),
        },
      });
      subscriptionId = created.id;
    } else {
      // Perpanjang dari expiresAt bila masih aktif, atau dari now bila sudah lewat.
      const base = existing.expiresAt > now ? existing.expiresAt : now;
      await tx.subscription.update({
        where: { id: existing.id },
        data: {
          planId: payment.planId,
          tokensTotal: { increment: quota },
          tokensRemaining: { increment: quota },
          expiresAt: addDays(base, days),
          status: "ACTIVE",
        },
      });
      subscriptionId = existing.id;
    }

    const refill = await tx.refill.create({
      data: {
        userId: payment.userId,
        subscriptionId,
        paymentId: payment.id,
        tokensAdded: quota,
        daysAdded: days,
      },
    });

    return { applied: true, subscriptionId, refillId: refill.id };
  });
}

/** Tolak pembayaran PENDING tanpa mengubah saldo. Idempoten. */
export async function rejectPayment(
  prisma: PrismaClient,
  paymentId: string,
  reason: string,
): Promise<ConfirmPaymentResult> {
  const marked = await prisma.payment.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "REJECTED", note: reason },
  });
  if (marked.count === 0) {
    return { applied: false, reason: "payment bukan PENDING / sudah diproses" };
  }
  return { applied: true };
}
