import { FC } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Shift } from "../types";

type ShiftCalendarProps = {
  shifts?: Shift[];
};

const ShiftCalendar: FC<ShiftCalendarProps> = ({ shifts = [] }) => {
  const events = shifts.map((shift) => ({
    title: `Shift ${shift.id} - Facility ${shift.facility_id} (${shift.profession})`,
    start: shift.start,
    end: shift.end,
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      initialView="dayGridMonth"
      weekends={false}
      events={events}
      eventContent={(info) => {
        return (
          <>
            <b>{info.timeText}</b> - <i>{info.event.title}</i>
          </>
        );
      }}
    />
  );
};

export default ShiftCalendar;
