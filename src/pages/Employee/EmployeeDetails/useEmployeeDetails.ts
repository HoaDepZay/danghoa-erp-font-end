import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";

export const useEmployeeDetails = (employeeId: string | null) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      setLoading(true);
      api.getEmployee(employeeId)
        .then((r: any) => {
          const payload = r.data?.data || r.data?.employee || r.data || null;
          setData(payload);
        })
        .catch(() => toast.error("Không thể tải thông tin"))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [employeeId]);

  return { data, loading };
};

