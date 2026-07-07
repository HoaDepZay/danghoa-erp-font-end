import { Btn } from '../../components/UI';
import React, { useState } from "react";
import { useOrgChart, OrgNodeData } from "./useOrgChart";
import { OrgChartNode } from "./OrgChartNode";
import { SectionHeader, Card, Drawer, Avatar, Badge } from "../../components/UI";
import { Network } from "lucide-react";
import "./OrgChart.css";
const OrgTreeNode: React.FC<{ node: OrgNodeData; onNodeClick: (node: OrgNodeData) => void }> = ({ node, onNodeClick }) => {
  return (
    <li>
      <div className="org-node-wrapper">
        <OrgChartNode node={node} onNodeClick={onNodeClick} />
      </div>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <OrgTreeNode key={child.id} node={child} onNodeClick={onNodeClick} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const OrgChart: React.FC = () => {
  const { loading, treeData, selectedNode, setSelectedNode } = useOrgChart();
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 1.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.5));

  return (
    <div className="animate-fade-in" style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      <SectionHeader title="Sơ đồ tổ chức" subtitle="Cấu trúc phân bổ nhân sự" />

      <Card padding={false} style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
        
        {/* Zoom Controls */}
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8, zIndex: 10, background: "#fff", padding: 8, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <Btn onClick={handleZoomOut} style={{ width: 32, height: 32, border: "1px solid #e2e8f0", borderRadius: 4, background: "#fff", cursor: "pointer", fontWeight: "bold" }}>-</Btn>
          <span style={{ display: "flex", alignItems: "center", fontSize: 13, minWidth: 40, justifyContent: "center" }}>{Math.round(scale * 100)}%</span>
          <Btn onClick={handleZoomIn} style={{ width: 32, height: 32, border: "1px solid #e2e8f0", borderRadius: 4, background: "#fff", cursor: "pointer", fontWeight: "bold" }}>+</Btn>
        </div>

        {/* Chart Area */}
        <div style={{ flex: 1, overflow: "auto", padding: 40, background: "#f8fafc" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div className="spinner" style={{ width: 40, height: 40, color: "#3b82f6" }}></div>
            </div>
          ) : !treeData ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b" }}>
              <Network size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p>Chưa có dữ liệu sơ đồ</p>
            </div>
          ) : (
            <div style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: "top center", 
              transition: "transform 0.2s",
              display: "flex",
              justifyContent: "center",
              minWidth: "max-content"
            }}>
              <div className="org-tree">
                <ul>
                  <OrgTreeNode node={treeData} onNodeClick={setSelectedNode} />
                </ul>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Details Drawer */}
      <Drawer
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={selectedNode?.type === "department" ? selectedNode?.title : "Danh sách nhân sự"}
        subtitle={selectedNode?.type === "department" ? selectedNode?.subtitle : selectedNode?.title}
        size="md"
      >
        {selectedNode?.type === "department" && selectedNode.departmentData && (
          <div style={{ marginBottom: 24, padding: 16, background: "#f1f5f9", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 14 }}>Thông tin phòng ban</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
              <div><span style={{ color: "#64748b" }}>Mã phòng:</span> {selectedNode.departmentData.MA_PHG}</div>
              <div><span style={{ color: "#64748b" }}>Ngày thành lập:</span> {new Date(selectedNode.departmentData.NGAY_THANH_LAP || selectedNode.departmentData.NG_THANHLAP).toLocaleDateString("vi-VN")}</div>
            </div>
          </div>
        )}

        <h4 style={{ margin: "0 0 16px 0", fontSize: 14, display: "flex", justifyContent: "space-between" }}>
          <span>Danh sách nhân sự ({selectedNode?.employees.length})</span>
        </h4>
        
        {selectedNode?.employees.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: 24 }}>Không có nhân sự nào</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {selectedNode?.employees.map(emp => (
              <div key={emp.MA_NV} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}>
                <Avatar name={emp.HO_TEN || emp.TEN_NV || "User"} src={emp.HINH_DAI_DIEN} size="md" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{emp.HO_TEN}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{emp.EMAIL || "—"}</p>
                </div>
                <div>
                  <Badge color={emp.CHUC_VU === "Giám đốc" ? "purple" : emp.CHUC_VU === "Quản lý" ? "blue" : "gray"}>
                    {emp.CHUC_VU}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default OrgChart;
