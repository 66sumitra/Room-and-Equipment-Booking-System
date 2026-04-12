'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function RoomComputersPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [selectedComputer, setSelectedComputer] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock data
  /*อันเก่าconst room = {
    id: roomId,
    name: 'ห้องคอมพิวเตอร์ 1-0303',
    roomCode: '1-0303',
    building: 'อาคาร 1',
    floor: '3',
    computerCount: 40,
  };*/
  // Mock data สำหรับทุกห้อง
const rooms = [
  {
    id: '1',
    name: 'ห้องคอมพิวเตอร์ 1-0303',
    roomCode: '1-0303',
    building: 'อาคาร 1',
    floor: '3',
    computerCount: 48,
  },
  {
    id: '2',
    name: 'ห้องคอมพิวเตอร์ 1-0304',
    roomCode: '1-0103',
    building: 'อาคาร 1',
    floor: '3',
    computerCount: 50,
  },
];

// เลือกห้องตาม roomId
const room = rooms.find((r) => r.id === roomId) ?? rooms[0];

  const computers = Array.from({ length: room.computerCount }, (_, i) => ({
  id: `pc-${i + 1}`,
  roomId: room.id,
  roomCode: room.roomCode,
  pcNumberInRoom: String(i + 1).padStart(2, '0'),
  pcCode: `${room.roomCode}-PC${String(i + 1).padStart(2, '0')}`,
  position: `แถว ${String.fromCharCode(65 + Math.floor(i / 10))} ที่นั่ง ${(i % 10) + 1}`,
  status: i % 10 === 0 ? 'maintenance' : i % 15 === 0 ? 'damaged' : 'available',
}));

/*อันเก่า  const computers = Array.from({ length: 40 }, (_, i) => ({
    id: `pc-${i + 1}`,
    roomId: roomId,
    roomCode: '1-0303',
    pcNumberInRoom: String(i + 1).padStart(2, '0'),
    pcCode: `1-0303-PC${String(i + 1).padStart(2, '0')}`,
    position: `แถว ${String.fromCharCode(65 + Math.floor(i / 10))} ที่นั่ง ${(i % 10) + 1}`,
    status: i % 10 === 0 ? 'maintenance' : i % 15 === 0 ? 'damaged' : 'available',
  })); */

  const handleViewDetail = (computer: any) => {
    setSelectedComputer(computer);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      damaged: 'bg-red-100 text-red-700',
      disabled: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      available: 'ว่าง',
      maintenance: 'ซ่อม',
      damaged: 'ชำรุด',
      disabled: 'ปิด',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <DashboardLayout
      title={`คอมพิวเตอร์ในห้อง ${room.roomCode}`}
      actionButton={
        <Link href="/admin/computers">
          <Button variant="secondary" size="md">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Room Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">ชื่อห้อง</p>
              <p className="text-lg font-semibold text-gray-800">{room.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">รหัสห้อง</p>
              <p className="text-lg font-semibold text-gray-800">{room.roomCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">สถานที่</p>
              <p className="text-lg font-semibold text-gray-800">{room.building} ชั้น {room.floor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">จำนวนเครื่อง</p>
              <p className="text-lg font-semibold text-gray-800">{room.computerCount} เครื่อง</p>
            </div>
          </div>
        </div>

        {/* Computers Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">รายการคอมพิวเตอร์ทั้งหมด</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                ว่าง: {computers.filter(c => c.status === 'available').length}
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
                ซ่อม: {computers.filter(c => c.status === 'maintenance').length}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                ชำรุด: {computers.filter(c => c.status === 'damaged').length}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
            {computers.map((computer) => (
              <div
                key={computer.id}
                onClick={() => handleViewDetail(computer)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  computer.status === 'available'
                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                    : computer.status === 'maintenance'
                    ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                    : 'border-red-300 bg-red-50 hover:border-red-400'
                }`}
              >
                <div className="text-center">
                  <p className="font-mono font-bold text-lg text-gray-800">{computer.pcNumberInRoom}</p>
                  <p className="font-mono text-xs text-gray-600 mt-1">{computer.pcCode}</p>
                  <div className="mt-2">
                    {getStatusBadge(computer.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{computer.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="รายละเอียดเครื่องคอมพิวเตอร์"
        size="md"
      >
        {selectedComputer && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">รหัสเครื่อง</p>
              <p className="font-mono font-semibold text-xl text-gray-800">{selectedComputer.pcCode}</p>
              <p className="text-sm text-gray-600 mt-2">เครื่องที่ {selectedComputer.pcNumberInRoom} ในห้อง {selectedComputer.roomCode}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">ตำแหน่ง</p>
                <p className="font-semibold text-gray-800">{selectedComputer.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">สถานะ</p>
                {getStatusBadge(selectedComputer.status)}
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  alert('แก้ไขเครื่องคอมพิวเตอร์');
                  setIsDetailModalOpen(false);
                }}
              >
                แก้ไขข้อมูล
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

