import type { Complaint } from "@kapas/domain";

import { buildComplaint } from "./factory";
import { DEMO_LOCATIONS } from "./locations";
import { createRng } from "./rng";

export function extraDemoComplaints(count: number, startIndex: number): Complaint[] {
  const rng = createRng(20260819 + startIndex);
  return Array.from({ length: count }, (_, offset) => {
    const location = rng.pick(DEMO_LOCATIONS);
    const dailyRate = rng.pick([950, 1000, 1100, 1200]);
    const days = rng.pick([6, 8, 10, 12]);
    return buildComplaint({
      index: startIndex + offset,
      categoryCode: "WAG",
      subcategoryCode: "WAG-DEL",
      status: "Submitted",
      priority: "Standard",
      privacyMode: "CONF",
      reporterType: "self",
      gender: rng.pick(["Female", "Male"] as const),
      affectedWorkerType: "seasonal-picker",
      affectedRange: "individual",
      location: { ...location, exactCoordinates: null },
      createdAt: "2026-08-18T08:00:00.000Z",
      currentDanger: false,
      description: `The cotton picking wage was agreed at PKR ${dailyRate} per day, but payment has been delayed for ${days} days after the work was completed near ${location.villageLabel}.`,
      descriptionUr: `${location.villageLabel} کے قریب کپاس چننے کی روزانہ اجرت ${dailyRate} روپے طے ہوئی تھی، مگر کام مکمل ہونے کے بعد ${days} دن سے ادائیگی نہیں ہوئی۔`,
      whenLabel: "This week",
      confidenceScore: 0.8,
      displayName: rng.pick(["Amina", "Razia", "Shazia", "Aslam", "Yousaf"] as const),
    });
  });
}
