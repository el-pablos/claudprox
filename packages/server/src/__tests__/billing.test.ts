import { describe, it, expect, vi } from "vitest";
import { confirmPayment, rejectPayment } from "../billing";

/**
 * Bangun mock PrismaClient yang cukup untuk confirmPayment/rejectPayment.
 * $transaction memanggil callback dengan objek tx yang sama (pola gateway test).
 */
function buildPrismaMock(opts: {
  payment: {
    id: string;
    userId: string;
    planId: string;
    status: string;
    note: string | null;
    plan: { tokenQuota: bigint; durationDays: number };
  } | null;
  markCount?: number;
  existingSubscription?: {
    id: string;
    expiresAt: Date;
  } | null;
}) {
  const paymentUpdateMany = vi.fn().mockResolvedValue({
    count: opts.markCount ?? 1,
  });
  const subscriptionCreate = vi
    .fn()
    .mockResolvedValue({ id: "sub_new" });
  const subscriptionUpdate = vi.fn().mockResolvedValue({});
  const refillCreate = vi.fn().mockResolvedValue({ id: "refill_1" });

  const tx = {
    payment: {
      findUnique: vi.fn().mockResolvedValue(opts.payment),
      updateMany: paymentUpdateMany,
    },
    subscription: {
      findFirst: vi
        .fn()
        .mockResolvedValue(opts.existingSubscription ?? null),
      create: subscriptionCreate,
      update: subscriptionUpdate,
    },
    refill: {
      create: refillCreate,
    },
  };

  const prisma = {
    $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)),
    payment: {
      updateMany: paymentUpdateMany,
    },
  };

  return { prisma, tx, paymentUpdateMany, subscriptionCreate, subscriptionUpdate, refillCreate };
}

const basePlan = { tokenQuota: 20_000_000n, durationDays: 3 };

describe("confirmPayment - idempotensi", () => {
  it("tidak apply bila payment tidak ditemukan", async () => {
    const { prisma } = buildPrismaMock({ payment: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await confirmPayment(prisma as any, "pay_x", "admin_1");
    expect(res.applied).toBe(false);
    expect(res.reason).toContain("tidak ditemukan");
  });

  it("tidak apply (no double-refill) bila payment sudah CONFIRMED", async () => {
    const { prisma, refillCreate } = buildPrismaMock({
      payment: {
        id: "pay_1",
        userId: "user_1",
        planId: "plan_1",
        status: "CONFIRMED",
        note: null,
        plan: basePlan,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await confirmPayment(prisma as any, "pay_1", "admin_1");
    expect(res.applied).toBe(false);
    expect(res.reason).toContain("CONFIRMED");
    expect(refillCreate).not.toHaveBeenCalled();
  });

  it("tidak apply bila status PENDING tapi update kalah balapan (count=0)", async () => {
    const { prisma, refillCreate } = buildPrismaMock({
      payment: {
        id: "pay_1",
        userId: "user_1",
        planId: "plan_1",
        status: "PENDING",
        note: null,
        plan: basePlan,
      },
      markCount: 0,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await confirmPayment(prisma as any, "pay_1", "admin_1");
    expect(res.applied).toBe(false);
    expect(refillCreate).not.toHaveBeenCalled();
  });
});

describe("confirmPayment - refill wallet", () => {
  it("buat subscription baru bila user belum punya yang aktif", async () => {
    const { prisma, subscriptionCreate, subscriptionUpdate, refillCreate } =
      buildPrismaMock({
        payment: {
          id: "pay_1",
          userId: "user_1",
          planId: "plan_1",
          status: "PENDING",
          note: null,
          plan: basePlan,
        },
        existingSubscription: null,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await confirmPayment(prisma as any, "pay_1", "admin_1");
    expect(res.applied).toBe(true);
    expect(subscriptionCreate).toHaveBeenCalledTimes(1);
    expect(subscriptionUpdate).not.toHaveBeenCalled();
    expect(refillCreate).toHaveBeenCalledTimes(1);
    const createArg = subscriptionCreate.mock.calls[0]![0].data;
    expect(createArg.tokensRemaining).toBe(20_000_000n);
    expect(res.refillId).toBe("refill_1");
  });

  it("perpanjang subscription aktif (tokens increment) bila sudah ada", async () => {
    const future = new Date(Date.now() + 86_400_000);
    const { prisma, subscriptionCreate, subscriptionUpdate, refillCreate } =
      buildPrismaMock({
        payment: {
          id: "pay_1",
          userId: "user_1",
          planId: "plan_1",
          status: "PENDING",
          note: null,
          plan: basePlan,
        },
        existingSubscription: { id: "sub_old", expiresAt: future },
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await confirmPayment(prisma as any, "pay_1", "admin_1");
    expect(res.applied).toBe(true);
    expect(res.subscriptionId).toBe("sub_old");
    expect(subscriptionCreate).not.toHaveBeenCalled();
    expect(subscriptionUpdate).toHaveBeenCalledTimes(1);
    expect(refillCreate).toHaveBeenCalledTimes(1);
    const updateArg = subscriptionUpdate.mock.calls[0]![0].data;
    expect(updateArg.tokensRemaining).toEqual({ increment: 20_000_000n });
  });
});

describe("rejectPayment", () => {
  it("apply true bila payment PENDING berhasil ditolak", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = { payment: { updateMany } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await rejectPayment(prisma as any, "pay_1", "dana tidak masuk");
    expect(res.applied).toBe(true);
  });

  it("apply false bila payment bukan PENDING (count=0)", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const prisma = { payment: { updateMany } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await rejectPayment(prisma as any, "pay_1", "alasan");
    expect(res.applied).toBe(false);
  });
});
