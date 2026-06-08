import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, Spinner } from "./UI";

export default function ProjectAnalysis({ projectId }: { projectId: number | string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    api.getProjectTasks(projectId).then((res: any) => {
      setTasks(res.data?.data || []);
      setLoading(false);
    }).catch((err: any) => {
      console.error(err);
      setLoading(false);
    });
  }, [projectId]);

  if (loading) return <Card><Spinner /></Card>;

  if (tasks.length === 0) return (
    <Card>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Biểu đồ phân tích dự án</h3>
      <p style={{ color: '#666', fontSize: 14 }}>Dự án chưa có nhiệm vụ nào để phân tích.</p>
    </Card>
  );

  const statuses: Record<string, number> = {
    'Mới tạo': 0,
    'Đang thực hiện': 0,
    'Chờ duyệt': 0,
    'Hoàn thành': 0
  };

  const statusColors: Record<string, string> = {
    'Mới tạo': '#94a3b8',
    'Đang thực hiện': '#3b82f6',
    'Chờ duyệt': '#eab308',
    'Hoàn thành': '#22c55e'
  };

  tasks.forEach(t => {
    const st = t.TRANG_THAI || 'Mới tạo';
    if (statuses[st] !== undefined) {
      statuses[st]++;
    } else {
      statuses[st] = 1;
    }
  });

  const total = tasks.length;
  
  let currentAngle = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  const svgPieces = Object.keys(statuses).map(key => {
    const val = statuses[key];
    if (val === 0) return null;
    const percentage = val / total;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -currentAngle;
    currentAngle += percentage * circumference;
    
    return (
      <circle
        key={key}
        cx="100"
        cy="100"
        r={radius}
        fill="transparent"
        stroke={statusColors[key] || '#ccc'}
        strokeWidth="25"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 100 100)"
        style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
      />
    );
  });

  return (
    <Card>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Biểu đồ phân tích tiến độ</h3>
      <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 200, height: 200, position: 'relative' }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            {svgPieces}
            <text x="100" y="105" textAnchor="middle" fontSize="32" fill="#111" fontWeight="800">
              {total}
            </text>
            <text x="100" y="125" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="600">
              NHIỆM VỤ
            </text>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 250, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.keys(statuses).map(key => {
            const val = statuses[key];
            const pct = total ? Math.round((val / total) * 100) : 0;
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors[key] || '#ccc' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{key}</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                    <strong style={{ color: '#111' }}>{val}</strong> ({pct}%)
                  </span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${pct}%`, 
                      background: statusColors[key] || '#ccc', 
                      borderRadius: 4,
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
