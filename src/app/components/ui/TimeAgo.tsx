import moment from "moment";
import { useState, useEffect } from "react";
export function TimeAgo({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = useState(moment(date).fromNow(false));

  useEffect(() => {
    setTimeAgo(moment(date).fromNow(false));
    const timer = setInterval(() => {
      setTimeAgo(moment(date).fromNow(false));
    }, 60000); // 每分鐘更新一次

    return () => clearInterval(timer);
  }, [date]);

  return timeAgo;
}
