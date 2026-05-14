export type UserRole = 'super_admin' | 'lab_admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  createdAt: Date;
  specialPermissions?: {
    advanceBookingDays?: number; 
    canBookWeekly?: boolean; 
    canBookSemester?: boolean; 
  };
}

export type RoomType = 'computer_lab' | 'lab' | 'equipment_center';

export interface Room {
  id: string;
  name: string;
  roomCode: string; // เช่น LAB501
  roomType: RoomType; // ห้องคอม / ห้องแลบ / ห้องเครื่องมือ
  building: string;
  floor: string;
  department?: string;
  description?: string;
  computerCount: number; // auto count จาก computers
  equipmentCount: number; // auto count จาก equipment
  createdAt: Date;
}

export interface Computer {
  id: string;
  roomId: string;
  roomCode: string; // เช่น LAB501
  pcNumberInRoom: string; // 01, 02, 03
  pcCode: string; // LAB501-PC01 (auto generate)
  position?: string; // เช่น แถว A ที่นั่ง 1
  specs?: {
    cpu?: string;
    ram?: string;
    storage?: string;
    gpu?: string;
  };
  status: 'available' | 'maintenance' | 'damaged' | 'disabled';
  createdAt: Date;
}

export interface Equipment {
  id: string;
  name: string;
  assetCode?: string; // รหัสครุภัณฑ์
  description: string;
  category: string;
  roomId: string;
  roomCode: string;
  location: string; // ตำแหน่งเก็บในห้อง
  quantity: number;
  available: number;
  status: 'available' | 'borrowed' | 'damaged' | 'maintenance';
  requiresApproval: boolean; // ต้องอนุมัติหรือไม่
  allowedRoles?: UserRole[]; // ใครยืมได้บ้าง
}

export interface Booking {
  id: string;
  type: 'computer' | 'equipment';
  itemId: string;
  itemName: string;
  itemCode: string; // เช่น LAB501-PC01 หรือ Equipment-001
  roomId: string;
  roomCode: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  date: Date;
  startTime: string;
  endTime: string;
  purpose?: string; // วัตถุประสงค์
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled';
  requiresApproval: boolean;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface BookingRule {
  id: string;
  userRole: UserRole;
  itemType: 'computer' | 'equipment';
  advanceBookingDays: number; 
  maxBookingHours?: number; 
  maxBookingDays?: number; 
  timeSlotStep?: number; 
  allowedEquipmentCategories?: string[]; 
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking_approved' | 'booking_rejected' | 'booking_reminder' | 'equipment_due' | 'system_alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface RoomIssue {
  id: string;
  roomId: string;
  roomName: string;
  issueType: 'maintenance' | 'damage' | 'cleaning' | 'other';
  description: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface EquipmentIssue {
  id: string;
  equipmentId: string;
  equipmentName: string;
  issueType: 'maintenance' | 'damage' | 'missing' | 'other';
  description: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

