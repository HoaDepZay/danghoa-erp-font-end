import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface SharedCalendarProps {
  events: any[];
  onEventClick?: (info: any) => void;
  eventContent?: (arg: any) => React.ReactNode;
  height?: string | number;
}

const SharedCalendar: React.FC<SharedCalendarProps> = ({ 
  events, 
  onEventClick, 
  eventContent,
  height = "auto"
}) => {
  return (
    <div className="shared-calendar-container" style={{ background: "#fff", borderRadius: 12 }}>
      <style>{`
        .shared-calendar-container .fc {
          font-family: inherit;
        }
        .shared-calendar-container .fc-toolbar-title {
          font-size: 18px;
          font-weight: 800;
          color: #111;
        }
        .shared-calendar-container .fc-button-primary {
          background-color: #fff;
          border-color: #e2e8f0;
          color: #475569;
          font-weight: 600;
          text-transform: capitalize;
          padding: 8px 16px;
          font-size: 13px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .shared-calendar-container .fc-button-primary:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
          color: #1e293b;
        }
        .shared-calendar-container .fc-button-primary:not(:disabled).fc-button-active, 
        .shared-calendar-container .fc-button-primary:not(:disabled):active {
          background-color: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }
        .shared-calendar-container .fc-button-primary:focus {
          box-shadow: none;
        }
        .shared-calendar-container .fc-daygrid-day-number {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          padding: 8px;
        }
        .shared-calendar-container .fc-col-header-cell {
          background: #f8fafc; 
          padding: 12px 0; 
          font-weight: 600; 
          color: #64748b;
        }
        .shared-calendar-container .fc-col-header-cell-cushion {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 12px 0;
          letter-spacing: 0.05em;
        }
        .shared-calendar-container .fc-event {
          border: none !important;
          border-radius: 6px;
          padding: 2px 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-bottom: 2px;
          overflow: hidden;
        }
        .shared-calendar-container .fc-event:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .shared-calendar-container .fc-day-today {
          background-color: #f8fafc !important;
        }
        @media (max-width: 768px) {
          .shared-calendar-container .fc-toolbar {
            flex-direction: column !important;
            gap: 12px;
          }
          .shared-calendar-container .fc-toolbar-title {
            font-size: 16px;
          }
          .shared-calendar-container .fc-button-primary {
            padding: 6px 12px;
            font-size: 12px;
          }
          .shared-calendar-container .fc-event {
            font-size: 10px;
          }
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={onEventClick}
        eventContent={eventContent}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek"
        }}
        locale="vi"
        buttonText={{
          today: "Hôm nay",
          month: "Tháng",
          week: "Tuần"
        }}
        height={height}
        dayMaxEvents={true}
        eventDisplay="block"
      />
    </div>
  );
};

export default SharedCalendar;
