import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, Spinner } from "./UI";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { checkOverdue } from "../utils/helpers";

export default function ProjectAnalysis({ projectId }: { projectId: number | string }) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Lấy danh sách các giai đoạn của dự án
        const phasesRes = await api.getPhasesByProject(projectId);
        const phases = phasesRes.data?.data || [];

        if (phases.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }

        // 2. Lấy nhiệm vụ cho từng giai đoạn đồng thời
        const tasksPromises = phases.map((p: any) => api.getTasksByPhase(p.MA_GD || p.maGd));
        const tasksResponses = await Promise.allSettled(tasksPromises);

        // 3. Xử lý dữ liệu
        const data = phases.map((p: any, index: number) => {
          const res = tasksResponses[index];
          const phaseTasks = res.status === "fulfilled" ? (res.value?.data?.data || res.value?.data || []) : [];
          
          let total = phaseTasks.length;
          let completed = 0;
          let overdue = 0;

          phaseTasks.forEach((t: any) => {
            const status = String(t.TRANG_THAI || t.trangThai || "").toLowerCase();
            const isCompleted = status === "đã duyệt" || status === "hoàn thành";
            if (isCompleted) {
              completed++;
            } else {
              const endDate = t.NGAY_KET_THUC || t.ngayKetThuc;
              if (checkOverdue(endDate, status)) {
                overdue++;
              }
            }
          });

          return {
            name: p.TEN_GD || p.tenGd || `Giai đoạn ${index + 1}`,
            "Tổng số": total,
            "Hoàn thành": completed,
            "Quá hạn": overdue,
          };
        });

        setChartData(data);
      } catch (err: any) {
        console.error("Lỗi lấy dữ liệu phân tích:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) return <Card><Spinner /></Card>;

  if (chartData.length === 0) return (
    <Card>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Biểu đồ phân tích dự án</h3>
      <p style={{ color: '#666', fontSize: 14 }}>Dự án chưa có giai đoạn hoặc nhiệm vụ nào để phân tích.</p>
    </Card>
  );

  return (
    <Card>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Biểu đồ phân tích tiến độ theo giai đoạn</h3>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 13 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
              cursor={{ fill: "#f1f5f9" }}
            />
            <Legend wrapperStyle={{ paddingTop: 20, fontSize: 14, fontWeight: 500 }} />
            
            {/* Cột 1: Tổng số */}
            <Bar dataKey="Tổng số" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
            {/* Cột 2: Hoàn thành */}
            <Bar dataKey="Hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
            {/* Cột 3: Quá hạn */}
            <Bar dataKey="Quá hạn" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
