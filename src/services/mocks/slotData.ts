export interface Slot {
  id: string;
  hospitalId: string;
  slotNumber: number; // Slot number for the day (starts from 1)
  startTime: string; // ISO string
  endTime: string; // ISO string
  maxCapacity: number;
  bookedCount: number;
  isBooked: boolean;
}

export const mockSlots: Slot[] = [];

// Helper to generate slots for 30 days
const generateSlots = () => {
  const hospitals = ['1', '2', '3']; // Sagar Apollo, City Clinic, Wellness Center
  const slotsPerDay = 15;
  const days = 30;
  const baseDate = new Date();
  baseDate.setHours(9, 0, 0, 0);

  hospitals.forEach(hId => {
    for (let d = 0; d < days; d++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + d);

      for (let s = 0; s < slotsPerDay; s++) {
        const startTime = new Date(currentDate);
        startTime.setMinutes(s * 30);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 30);

        const maxCapacity = 6 + Math.floor(Math.random() * 5); // 6-10
        const bookedCount = Math.floor(Math.random() * (maxCapacity + 1));
        
        mockSlots.push({
          id: `SLOT-${hId}-${d}-${s}`,
          hospitalId: hId,
          slotNumber: s + 1,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          maxCapacity,
          bookedCount,
          isBooked: bookedCount >= maxCapacity
        });
      }
    }
  });
};

generateSlots();
