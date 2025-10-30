"use client";
import {
  Button,
  Datepicker,
  Eventcalendar,
  Input,
  MbscCalendarEvent,
  MbscCellClickEvent,
  MbscDatepickerChangeEvent,
  MbscDatepickerControl,
  MbscDateType,
  MbscEventcalendarView,
  MbscEventClickEvent,
  MbscEventCreatedEvent,
  MbscEventDeletedEvent,
  MbscPopupButton,
  Popup,
  setOptions,
  Snackbar,
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

  const now = useMemo(() => new Date(), []);
  const today = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    [now]
  );
  const yesterday = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    [now]
  );

  const invalidDates = useMemo(
    () => [
      { recurring: { repeat: "daily", until: yesterday } },
      { start: today, end: now },
    ],
    [now, today, yesterday]
  );

  const [events, setEvents] = useState<MbscCalendarEvent[]>(randomEvents);
  const [tempEvent, setTempEvent] = useState<MbscCalendarEvent>();
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [isEdit, setEdit] = useState<boolean>(false);
  const [start, startRef] = useState<Input | null>(null);
  const [end, endRef] = useState<Input | null>(null);

  const [popupEventTitle, setTitle] = useState<string>("");
  const [popupEventDescription, setDescription] = useState<string>("");
  const [popupEventDate, setDate] = useState<MbscDateType[]>([]);
  const [isSnackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarConfig, setSnackbarConfig] = useState<{
    message: string;
    withUndo?: boolean;
  }>({ message: "", withUndo: false });

  const calInst = useRef<Eventcalendar>(null);

  const myView = useMemo<MbscEventcalendarView>(
    () => ({
      timeline: {
        type: "week",
        startDay: 1,
        endDay: 5,
        timeCellStep: 15,
        timeLabelStep: 30,
      },
    }),
    []
  );

  const saveEvent = useCallback(() => {
    const newEvent = {
      id: tempEvent!.id,
      title: popupEventTitle,
      description: popupEventDescription,
      start: popupEventDate[0],
      end: popupEventDate[1],
      resource: tempEvent!.resource,
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
    isEdit,
    events,
    popupEventDate,
    popupEventDescription,
    popupEventTitle,
    tempEvent,
  ]);

  const showSnackbar = useCallback((message: string, withUndo?: boolean) => {
    setSnackbarConfig({ message, withUndo });
    setSnackbarOpen(true);
  }, []);

  const deleteEvent = useCallback(
    (event: MbscCalendarEvent) => {
      const filteredEvents = events.filter((item) => item.id !== event.id);
      setTempEvent(event);
      setEvents(filteredEvents);

      showSnackbar("Event deleted", true);
    },
    [events, showSnackbar]
  );

  const loadPopupForm = useCallback((event: MbscCalendarEvent) => {
    setTitle(event.title!);
    setDescription(event.description);
    setDate([event.start!, event.end!]);
  }, []);

  const titleChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setTitle(ev.target.value);
  }, []);

  const descriptionChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setDescription(ev.target.value);
  }, []);

  const dateChange = useCallback((args: MbscDatepickerChangeEvent) => {
    setDate(args.value as MbscDateType[]);
  }, []);

  const controls = useMemo<MbscDatepickerControl[]>(() => ["datetime"], []);

  const onDeleteClick = useCallback(() => {
    deleteEvent(tempEvent!);
    setPopupOpen(false);
  }, [deleteEvent, tempEvent]);

  const handleEventDoubleClick = useCallback(
    (args: MbscEventClickEvent) => {
      const nowISO = new Date().toISOString();
      if (args.event.end! <= nowISO) {
        setSnackbarConfig({
          message: "Cannot edit completed events.",
        });
        setSnackbarOpen(true);
        return;
      }

      if (args.event.start! <= nowISO && args.event.end! > nowISO) {
        setSnackbarConfig({
          message: "Cannot edit events that are currently in progress.",
        });
        setSnackbarOpen(true);
        return;
      }

      setEdit(true);
      setTempEvent({ ...args.event });

      loadPopupForm(args.event);
      setPopupOpen(true);
    },
    [loadPopupForm]
  );

  const handleEventCreated = useCallback(
    (args: MbscEventCreatedEvent) => {
      setEdit(false);
      setTempEvent(args.event);

      loadPopupForm(args.event);

      setPopupOpen(true);
    },
    [loadPopupForm]
  );

  const handleEventDeleted = useCallback(
    (args: MbscEventDeletedEvent) => {
      deleteEvent(args.event);
    },
    [deleteEvent]
  );

  const handleEventUpdated = useCallback(() => {
    // Here you can update the event in your storage as well, after drag & drop or resize
  }, []);

  const headerText = useMemo<string>(
    () => (isEdit ? "Edit event" : "New Event"),
    [isEdit]
  );

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
          disabled: popupEventTitle.length < 5,
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
          disabled: popupEventTitle.length < 5,
        },
      ];
    }
  }, [isEdit, popupEventTitle.length, saveEvent]);

  const onPopupClose = useCallback(() => {
    if (!isEdit) {
      setEvents([...events]);
    }

    setTitle("");
    setDescription("");
    setDate([]);
    setPopupOpen(false);
  }, [isEdit, events]);

  const handleSnackbarClose = useCallback(() => setSnackbarOpen(false), []);

  const handleCellDoubleClicked = useCallback((args: MbscCellClickEvent) => {
    if (args.date < new Date()) {
      setSnackbarConfig({
        message: "Cannot create events in the past.",
      });
      setSnackbarOpen(true);
      return;
    }

    setEdit(false);
    setTempEvent({ resource: args.resource, date: args.date });

    setDate([args.date, new Date(args.date.getTime() + 30 * 60000)]);

    setPopupOpen(true);
  }, []);

  return (
    <div>
      <Eventcalendar
        eventDelete={true}
        data={events}
        resources={randomResources}
        view={myView}
        ref={calInst}
        eventOverlap={false}
        dragToCreate={true}
        dragToMove={true}
        dragToResize={true}
        onEventDoubleClick={handleEventDoubleClick}
        onEventCreated={handleEventCreated}
        onEventDeleted={handleEventDeleted}
        onEventUpdated={handleEventUpdated}
        onCellDoubleClick={handleCellDoubleClicked}
        invalid={invalidDates}
      />

      <Popup
        display="center"
        fullScreen={true}
        headerText={headerText}
        buttons={popupButtons}
        isOpen={popupOpen}
        onClose={onPopupClose}
      >
        <Input
          label="Title"
          value={popupEventTitle}
          onChange={titleChange}
          maxLength={35}
          minLength={5}
          error={popupEventTitle.length < 5 || popupEventTitle.length > 35}
          errorMessage={
            popupEventTitle.length < 5 || popupEventTitle.length > 35
              ? "Title must be between 5 and 35 characters."
              : undefined
          }
        />
        <Input
          label="Description"
          value={popupEventDescription}
          onChange={descriptionChange}
        />

        <Input ref={startRef} label="Starts" />
        <Input ref={endRef} label="Ends" />
        <Datepicker
          select="range"
          controls={controls}
          touchUi={true}
          startInput={start}
          endInput={end}
          showRangeLabels={false}
          onChange={dateChange}
          value={popupEventDate}
          stepMinute={15}
          minRange={900000}
          maxRange={86400000}
          invalid={invalidDates}
        />

        {isEdit ? (
          <div className="mbsc-button-group">
            <Button
              className="mbsc-button-block"
              color="danger"
              variant="outline"
              onClick={onDeleteClick}
            >
              Delete event
            </Button>
          </div>
        ) : null}
      </Popup>

      <Snackbar
        message={snackbarConfig.message}
        isOpen={isSnackbarOpen}
        onClose={handleSnackbarClose}
        button={
          snackbarConfig.withUndo
            ? {
                action: () => {
                  setEvents([...events, tempEvent!]);
                },
                text: "Undo",
              }
            : undefined
        }
      />
    </div>
  );
}
