import React from "react";
import { Text, Flex, Button } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import { useRouteMatch } from "react-router-dom";
import dayjs from "dayjs";
import "react-datepicker/dist/react-datepicker.css";

interface TimePickerProps {
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
}

const useChangeTime = (props: TimePickerProps) => {
  const { setCurrentTime } = props;
  const changeTime = React.useCallback(
    (date: Date | [Date, Date] | null, event) => {
      if (event.type !== "click") return;
      if (date === null) return;
      if (Array.isArray(date)) return setCurrentTime(date[0].getTime());
      return setCurrentTime(date.getTime());
    },
    [setCurrentTime]
  );
  return changeTime;
};

const TimePicker: React.FC<TimePickerProps> = (props) => {
  const { currentTime } = props;
  const changeTime = useChangeTime(props);
  const match = useRouteMatch({ path: "/", strict: true, sensitive: true });
  if (!match?.isExact) return null;
  return (
    <Flex
      data-testid="time-picker"
      width="200px"
      justifyContent="center"
      pb="16px"
      alignItems="center"
    >
      <DatePicker
        value={dayjs(currentTime).format("MM/DD/YYYY")}
        customInput={
          <Flex flexDirection="column" alignItems="center">
            <Text fontWeight={600} pb="8px">
              {dayjs(currentTime).format("MM/DD/YYYY")}
            </Text>
            <Button colorScheme="teal">Change the Date</Button>
          </Flex>
        }
        selected={new Date(currentTime)}
        onChange={changeTime}
      />
    </Flex>
  );
};

export default TimePicker;
