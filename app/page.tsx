"use client";
import {
  Button,
  Eventcalendar,
  Input,
  MbscCalendarEvent,
  MbscDateType,
  MbscEventcalendarView,
  MbscEventCreatedEvent,
  MbscPopupButton,
  Popup,
  setOptions,
  Switch,
  Textarea,
  Toast,
} from "@mobiscroll/react";
import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import { generateRandomEvents } from "@/app/utils/generateRandomEvents";
import { generateRandomResources } from "@/app/utils/generateRandomResources";

setOptions({
  theme: "material",
  themeVariant: "light",
});

export default function Home() {
  const randomEvents = useMemo(() => generateRandomEvents(), []);
  const randomResources = useMemo(() => generateRandomResources(), []);

  const [events, setEvents] = useState(randomEvents);
  const [tempEvent] = useState<MbscCalendarEvent>();
  const [isEdit, setIsEdit] = useState(false);
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const [eventTitle, setEventTitle] = useState<string | undefined>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventAllDay, setEventAllDay] = useState(false);
  const [eventDate, setEventDate] = useState<MbscDateType[]>();

  const calInst = useRef<Eventcalendar>(null);

  const myView = useMemo<MbscEventcalendarView>(
    () => ({
      timeline: {
        type: "month",
        startDay: 1,
        endDay: 5,
        startTime: "08:00",
        endTime: "18:00",
        timeCellStep: 15,
        timeLabelStep: 30,
        allDay: false,
      },
    }),
    []
  );

  const showToast = useCallback((message: string) => {
    setToastText(message);
    setToastOpen(true);
  }, []);

  const handleEventCreated = useCallback((args: MbscEventCreatedEvent) => {
    setIsEdit(false);
    setPopupOpen(true);
    setAnchorEl(args.target);
  }, []);

  const handleEventUpdated = useCallback(() => {
    showToast("Appointment updated");
  }, [showToast]);

  const handleEventDeleted = useCallback(() => {
    showToast("Appointment deleted");
  }, [showToast]);

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
  }, []);

  const saveEvent = useCallback(() => {
    const newEvent = {
      id: tempEvent!.id,
      title: eventTitle,
      description: eventDescription,
      start: eventDate![0],
      end: eventDate![1],
      allDay: eventAllDay,
    };
    if (isEdit) {
      const index = events.findIndex((x) => x.id === tempEvent!.id);
      const newEventList = [...events];

      newEventList.splice(index, 1, newEvent);
      setEvents(newEventList);
    } else {
      setEvents([...events, newEvent]);
    }
    calInst.current?.navigateToEvent(newEvent);
    setPopupOpen(false);
  }, [
    tempEvent,
    eventTitle,
    eventDescription,
    eventDate,
    eventAllDay,
    isEdit,
    events,
  ]);

  const popupButtons = useMemo<(string | MbscPopupButton)[]>(() => {
    if (isEdit) {
      return [
        "cancel",
        {
          handler: () => {
            saveEvent();
          },
          keyCode: "enter",
          text: "Save",
        },
      ];
    } else {
      return [
        "cancel",
        {
          handler: () => {
            saveEvent();
          },
          keyCode: "enter",
          text: "Add",
        },
      ];
    }
  }, [isEdit, saveEvent]);

  const onClose = useCallback(() => {
    setEventTitle("");
    setEventDescription("");
    setEventAllDay(false);
    setEventDate(undefined);
    setPopupOpen(false);
  }, []);

  return (
    <div>
      <div className={"flex justify-end p-4"}>
        <Button color="primary">Add Event</Button>
      </div>
      {/* TODO: Gabi - are we using anchorel? */}
      <Eventcalendar
        eventDelete={true}
        cssClass="mds-healthcare"
        data={events}
        dragTimeStep={15}
        groupBy="date"
        resources={randomResources}
        view={myView}
        onEventCreated={handleEventCreated}
        onEventDeleted={handleEventDeleted}
        onEventUpdated={handleEventUpdated}
        clickToCreate={true}
        dragToCreate={true}
        dragToMove={true}
        dragToResize={true}
        onEventCreate={(e) => console.log({ e })}
        ref={(instance) => {
          calInst.current = instance;
        }}
      />

      <Popup
        display="center"
        fullScreen={true}
        headerText={isEdit ? "Edit event" : "New event"}
        anchor={anchorEl}
        buttons={popupButtons}
        isOpen={popupOpen}
        onClose={onClose}
      >
        <Input
          label="Title"
          value={eventTitle}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEventTitle(e.target.value)
          }
        />
        <Textarea
          label="Description"
          value={eventDescription}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEventDescription(e.target.value)
          }
        />

        <Switch
          label="All-day"
          checked={eventAllDay}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEventAllDay(e.target.checked)
          }
        />
        {/* <Input ref={startRef} label="Starts" />
          <Input ref={endRef} label="Ends" />
          <Datepicker
            select="range"
            controls={controls}
            touchUi={true}
            startInput={start}
            endInput={end}
            showRangeLabels={false}
            responsive={datepickerResponsive}
            onChange={dateChange}
            value={popupEventDate}
          />
           */}
        {isEdit ? (
          <div className="mbsc-button-group">
            <Button
              className="mbsc-button-block"
              color="danger"
              variant="outline"
              onClick={() => console.log("Delete event")}
            >
              Delete event
            </Button>
          </div>
        ) : null}
      </Popup>

      <Toast
        message={toastText}
        isOpen={isToastOpen}
        onClose={handleToastClose}
      />
    </div>
  );
}
