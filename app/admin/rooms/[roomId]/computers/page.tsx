'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function RoomComputersPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<any>(null);
  const [computers, setComputers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComputer, setSelectedComputer] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: pcData, error: pcError } = await supabase
        .from('computers')
        .select('*')
        .eq('room_name', roomId)
        .order('pc_name', { ascending: true });

      if (pcError) throw pcError;
      setComputers(pcData || []);

      setRoom({
        roomCode: roomId,
        name: `ห้องคอมพิวเตอร์ ${roomId}`,
        building: 'อาคาร 1',
        floor: roomId.includes('-') ? roomId.split('-')[1].substring(1, 2) : '5',
      });
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) fetchData();
  }, [roomId]);

  const handleViewDetail = (computer: any) => {
    setSelectedComputer(computer);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      available: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      occupied: 'bg-blue-100 text-blue-700',
      damaged: 'bg-red-100 text-red-700',
    };

    const labels: any = {
      available: 'ว่าง',
      maintenance: 'ซ่อม',
      occupied: 'ใช้งาน',
      damaged: 'ชำรุด',
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          styles[status] || 'bg-gray-100'
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="กำลังโหลด..." allowedRoles={['admin']}>
        <div className="flex justify-center items-center h-64">
          <p className="animate-pulse text-gray-500">กำลังดึงข้อมูลคอมพิวเตอร์...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`คอมพิวเตอร์ในห้อง ${roomId}`}
      allowedRoles={['admin']}
      actionButton={
        <Link href="/rooms">
          <Button variant="secondary" size="md">
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              กลับ
            </span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">รหัสห้อง</p>
              <p className="text-lg font-bold text-gray-800">{roomId}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">สถานที่</p>
              <p className="text-lg font-bold text-gray-800">
                {room?.building} ชั้น {room?.floor}
              </p>
            </div>

            <div className="md:col-span-2 text-right">
              <p className="text-xs text-gray-400 font-bold uppercase">สรุปสถานะ</p>
              <div className="flex gap-2 justify-end mt-1">
                <span className="text-xs font-bold text-green-600">
                  ว่าง: {computers.filter((c) => c.status === 'available').length}
                </span>
                <span className="text-xs font-bold text-yellow-600">
                  ซ่อม: {computers.filter((c) => c.status === 'maintenance').length}
                </span>
                <span className="text-xs font-bold text-red-600">
                  ชำรุด: {computers.filter((c) => c.status === 'damaged').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-gray-800 font-bold mb-6">ผังที่นั่งคอมพิวเตอร์</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
            {computers.map((pc, index) => (
              <div
                key={pc.id}
                onClick={() => handleViewDetail(pc)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 shadow-sm flex flex-col items-center justify-center gap-1 ${
                  pc.status === 'available'
                    ? 'border-green-100 bg-green-50'
                    : pc.status === 'maintenance'
                    ? 'border-yellow-100 bg-yellow-50'
                    : 'border-red-100 bg-red-50'
                }`}
              >
                <span className="text-[10px] font-black text-gray-400 uppercase">
                  PC-{String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-black text-gray-800">{pc.pc_name}</p>
                {getStatusBadge(pc.status)}
              </div>
            ))}
          </div>

          {computers.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <p className="text-gray-400">ไม่พบข้อมูลคอมพิวเตอร์ในห้องนี้</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="สเปกเครื่องคอมพิวเตอร์"
        size="md"
      >
        {selectedComputer && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 text-white shadow-inner">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                Computer ID
              </p>
              <p className="text-2xl font-black">{selectedComputer.pc_name}</p>
              <div className="mt-4 flex gap-2">
                {getStatusBadge(selectedComputer.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">CPU</span>
                <span className="font-bold">{selectedComputer.cpu || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">RAM</span>
                <span className="font-bold">{selectedComputer.ram} GB</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Storage</span>
                <span className="font-bold">{selectedComputer.storage || 'N/A'}</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full h-12 text-lg font-bold"
              onClick={() => setIsDetailModalOpen(false)}
            >
              แก้ไขสถานะเครื่อง
            </Button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}