'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
<<<<<<< HEAD
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  // Sample data
  const stats = {
    rooms: {
      total: 5,
      computerLab: 3,
      lab: 1,
      equipmentCenter: 1,
    },
    computers: {
      total: 120,
      available: 85,
      booked: 25,
      maintenance: 8,
      damaged: 2,
    },
    equipment: {
      total: 45,
      available: 28,
      borrowed: 15,
      damaged: 2,
    },
    bookings: {
      today: 8,
      thisWeek: 32,
      pending: 5,
      completed: 120,
    },
    utilization: {
      computers: 72, // เปอร์เซ็นต์
      equipment: 33, // เปอร์เซ็นต์
    },
  };

  const recentBookings = [
    {
      id: '1',
      itemName: '1-0303-PC03',
      itemCode: '1-0303-PC03',
      userName: 'อาจารย์สมชาย',
      date: '2025-12-15',
      time: '09:00 - 12:00',
      status: 'approved',
      type: 'computer',
    },
    {
      id: '2',
      itemName: 'โน๊ตบุ๊ค Dell',
      itemCode: 'ASSET-001',
      userName: 'นักศึกษามานะ',
      date: '2025-12-15',
      time: '14:00 - 17:00',
      status: 'checked_in',
      type: 'equipment',
    },
    {
      id: '3',
      itemName: '1-0103-PC15',
      itemCode: '1-0103-PC15',
      userName: 'อาจารย์สมหญิง',
      date: '2025-12-16',
      time: '08:00 - 12:00',
      status: 'pending',
      type: 'computer',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      itemName: '1-0303-PC20',
      itemCode: '1-0303-PC20',
      userName: 'อาจารย์วิชัย',
      date: '2025-12-17',
      time: '09:00 - 17:00',
      type: 'computer',
      requestedAt: '2025-12-14 10:30',
    },
    {
      id: '2',
      itemName: 'กล้อง Canon EOS R6',
      itemCode: 'ASSET-002',
      userName: 'นักศึกษาสมใจ',
      date: '2025-12-18',
      time: '10:00 - 16:00',
      type: 'equipment',
      requestedAt: '2025-12-14 14:20',
    },
  ];

  const equipmentDueSoon = [
    {
      id: '1',
      equipmentName: 'โน๊ตบุ๊ค Dell',
      itemCode: 'ASSET-001',
      userName: 'นักศึกษามานะ',
      dueDate: '2025-12-15',
      dueTime: '17:00',
      hoursRemaining: 2,
    },
    {
      id: '2',
      equipmentName: 'โปรเจคเตอร์ Epson',
      itemCode: 'ASSET-003',
      userName: 'อาจารย์สมชาย',
      dueDate: '2025-12-15',
      dueTime: '18:00',
      hoursRemaining: 3,
    },
  ];

  const issues = [
    {
      id: '1',
      type: 'computer',
      name: '1-0303-PC10',
      itemCode: '1-0303-PC10',
      issueType: 'maintenance',
      description: 'เครื่องไม่เปิด',
      reportedAt: '2025-12-14',
      priority: 'high',
    },
    {
      id: '2',
      type: 'equipment',
      name: 'แท็บเล็ต iPad #3',
      itemCode: 'ASSET-004',
      issueType: 'damage',
      description: 'หน้าจอแตก',
      reportedAt: '2025-12-13',
      priority: 'medium',
    },
  ];

  const topBookedRooms = [
    { roomCode: '1-0303', bookings: 45, utilization: 85 },
    { roomCode: '1-0103', bookings: 32, utilization: 68 },
    /*{ roomCode: 'LAB201', bookings: 28, utilization: 72 },*/
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      checked_in: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    const labels = {
      approved: 'อนุมัติแล้ว',
      checked_in: 'เช็คอินแล้ว',
      pending: 'รออนุมัติ',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <DashboardLayout title="แดชบอร์ด">
      <div className="space-y-4">
        {/* Overview Stats Boxes - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Rooms Box */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">ห้องทั้งหมด</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.rooms.total}</p>
            <p className="text-xs text-gray-500 mt-1">คอม {stats.rooms.computerLab} • แลบ {stats.rooms.lab} • เครื่องมือ {stats.rooms.equipmentCenter}</p>
          </div>

          {/* Total Computers Box */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">คอมพิวเตอร์</h3>
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.computers.total}</p>
            <p className="text-xs text-gray-500 mt-1">ว่าง {stats.computers.available} • จอง {stats.computers.booked}</p>
          </div>

          {/* Total Equipment Box */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">อุปกรณ์</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.equipment.total}</p>
            <p className="text-xs text-gray-500 mt-1">ว่าง {stats.equipment.available} • ยืม {stats.equipment.borrowed}</p>
          </div>

          {/* Pending Approvals Box */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">รออนุมัติ</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.bookings.pending}</p>
            <p className="text-xs text-gray-500 mt-1">การจองที่รอการอนุมัติ</p>
          </div>
        </div>

        {/* Computer Status Boxes - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">{stats.computers.available}</p>
              <p className="text-sm font-medium text-gray-800">ว่าง</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600 mb-2">{stats.computers.booked}</p>
              <p className="text-sm font-medium text-gray-800">ถูกจอง</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600 mb-2">{stats.computers.maintenance}</p>
              <p className="text-sm font-medium text-gray-800">ซ่อมบำรุง</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600 mb-2">{stats.computers.damaged}</p>
              <p className="text-sm font-medium text-gray-800">ชำรุด</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - 2 boxes */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recent Bookings Box */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">การจองล่าสุด</h2>
                  <Link href="/bookings">
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      ดูทั้งหมด
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-2xl">
                            {booking.type === 'computer' ? '💻' : '📦'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">{booking.itemName}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-mono text-xs">{booking.itemCode}</span>
                            <span>•</span>
                            <span>{booking.userName}</span>
                            <span>•</span>
                            <span>{booking.date} {booking.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistics & Top Booked Rooms Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Booking Statistics Box */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">สถิติการจอง</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">วันนี้</span>
                    <span className="text-xl font-bold text-blue-600">{stats.bookings.today}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                    <span className="text-sm text-gray-600">สัปดาห์นี้</span>
                    <span className="text-xl font-bold text-teal-600">{stats.bookings.thisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">เสร็จสิ้น</span>
                    <span className="text-xl font-bold text-green-600">{stats.bookings.completed}</span>
                  </div>
                </div>
              </div>

              {/* Top Booked Rooms Box */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ห้องที่จองมากที่สุด</h3>
                <div className="space-y-3">
                  {topBookedRooms.map((room, index) => (
                    <div key={room.roomCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{room.roomCode}</p>
                          <p className="text-xs text-gray-500">{room.bookings} การจอง</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">{room.utilization}%</p>
                        <p className="text-xs text-gray-500">การใช้งาน</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Alerts & Actions */}
          <div className="space-y-4">
            {/* Pending Approvals & Equipment Due - Side by Side */}
            <div className="grid grid-cols-1 gap-4">
              {/* Pending Approvals Box */}
              {pendingApprovals.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">รออนุมัติ</h2>
                      <Link href="/approvals">
                        <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                          ดูทั้งหมด
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {pendingApprovals.map((approval) => (
                        <div
                          key={approval.id}
                          className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-800 mb-1">{approval.itemName}</p>
                              <p className="text-xs text-gray-600 mb-1 font-mono">{approval.itemCode}</p>
                              <p className="text-xs text-gray-600">{approval.userName}</p>
                              <p className="text-xs text-gray-500 mt-1">{approval.date} {approval.time}</p>
                            </div>
                            <Link href={`/approvals?id=${approval.id}`}>
                              <Button variant="primary" size="sm" className="text-xs whitespace-nowrap">
                                อนุมัติ
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Equipment Due Soon Box */}
              {equipmentDueSoon.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">อุปกรณ์ใกล้ครบกำหนด</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {equipmentDueSoon.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <p className="font-mono text-sm font-semibold text-gray-800 mb-1">{item.itemCode}</p>
                          <p className="text-sm text-gray-600 mb-2">{item.userName}</p>
                          <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>ครบกำหนด: {item.dueDate} {item.dueTime}</span>
                          </div>
                          <p className="text-xs text-gray-600">เหลือเวลา {item.hoursRemaining} ชั่วโมง</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Row - Issues & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Issues Box - Left Side */}
          {issues.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">ปัญหาที่รายงาน</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <p className="font-semibold text-sm text-gray-800 mb-1">{issue.name}</p>
                      {issue.itemCode && (
                        <p className="font-mono text-xs text-gray-600 mb-2">{issue.itemCode}</p>
                      )}
                      <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                      <p className="text-xs text-gray-500">รายงานเมื่อ: {issue.reportedAt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Box - Right Side */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">การดำเนินการด่วน</h2>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <Link href="/admin/computers">
                <Button variant="primary" className="w-full justify-start">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มคอมพิวเตอร์
                </Button>
              </Link>
              <Link href="/equipment">
                <Button variant="secondary" className="w-full justify-start">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มอุปกรณ์
                </Button>
              </Link>
              <Link href="/bookings">
                <Button variant="secondary" className="w-full justify-start">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ดูรายงานการจอง
                </Button>
              </Link>
=======
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRooms: 5,
    totalComputers: 0,
    available: 0,
    booked: 0,
    maintenance: 0,
    pendingCount: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: computers } = await supabase.from('computers').select('status');
    const { count: pCount } = await supabase
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    const { data: bookings } = await supabase
      .from('borrow_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (computers) {
      setStats(prev => ({
        ...prev,
        totalComputers: computers.length,
        available: computers.filter(c => c.status === 'available').length,
        booked: computers.filter(c => c.status === 'booked').length,
        maintenance: computers.filter(c => c.status === 'maintenance').length,
        pendingCount: pCount || 0
      }));
    }
    if (bookings) setRecentBookings(bookings);
  };

  return (
    <DashboardLayout title="ระบบจัดการห้องคอมและอุปกรณ์">
      <div className="space-y-6 text-black">
        
        {/* การ์ดสถิติแถวบน */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase">ห้องทั้งหมด</h3>
            <p className="text-2xl font-black">{stats.totalRooms}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-teal-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase">คอมพิวเตอร์</h3>
            <p className="text-2xl font-black">{stats.totalComputers}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase">พร้อมใช้งาน</h3>
            <p className="text-2xl font-black text-green-600">{stats.available}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase">รออนุมัติ</h3>
            <p className="text-2xl font-black text-yellow-600">{stats.pendingCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ฝั่งซ้าย: ประวัติการจองล่าสุด */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-black">📅 ประวัติการจองล่าสุด</h2>
              <Link href="/admin/bookings" className="text-blue-600 text-sm font-bold hover:underline">ดูทั้งหมด</Link>
            </div>
            <div className="p-4 space-y-3">
              {recentBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">💻</div>
                     <div>
                       <p className="font-bold text-sm text-gray-800">{b.item_name || 'PC-Unknown'}</p>
                       <p className="text-[11px] text-gray-500 font-bold">{b.user_name} • {new Date(b.created_at).toLocaleDateString('th-TH')}</p>
                     </div>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black ${b.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                     {b.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                   </span>
                </div>
              ))}
            </div>
          </div>

          {/* ฝั่งขวา: ต้องอนุมัติด่วน */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-black mb-4 text-orange-600">⚠️ ต้องอนุมัติด่วน</h2>
            <div className="space-y-4">
               {recentBookings.filter(b => b.status === 'pending').length > 0 ? (
                 recentBookings.filter(b => b.status === 'pending').slice(0, 3).map((req) => (
                   <div key={req.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-black text-xs text-gray-800">{req.item_name}</p>
                          <p className="text-[10px] text-gray-500 font-mono font-bold uppercase">{req.item_code || 'LAB-PC'}</p>
                        </div>
                        {/* แก้ Path เป็น /approvals ตามที่แม่บอกแล้วครับ */}
                        <Link href={`/approvals?id=${req.id}`}>
                          <button className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black hover:bg-blue-700 transition-colors">อนุมัติ</button>
                        </Link>
                      </div>
                      <div className="text-[11px] text-gray-600 font-bold">
                        <p>👤 {req.user_name}</p>
                        <p className="text-orange-600">⏰ {new Date(req.created_at).toLocaleTimeString('th-TH')} น.</p>
                      </div>
                   </div>
                 ))
               ) : (
                 <p className="text-sm text-gray-400 font-bold text-center py-4">✅ ไม่มีรายการค้าง</p>
               )}

               {/* ปุ่มสีดำ "จัดการคำขอทั้งหมด" - วาร์ปไป /approvals ตรงๆ เลยแม่! */}
               <Link href="/approvals">
                 <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all">
                   จัดการคำขอทั้งหมด ({stats.pendingCount})
                 </button>
               </Link>
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
