import { useEffect, useRef, useState } from "react";
import { getRequestLogs } from "../api/requests";

const IN_FLIGHT = ["provisioning", "destroying"];

function classifyLine(line) {
  if (line.startsWith("$ ")) return "console-cmd";
  if (/Apply complete!|Destroy complete!/.test(line)) return "console-success";
  if (/: (Creation complete|Destruction complete)/.test(line)) return "console-success";
  if (/^Error:/.test(line)) return "console-error";
  if (/^Warning:/.test(line)) return "console-warn";
  if (/: (Creating|Destroying|Modifying)\.\.\./.test(line)) return "console-action";
  if (/^Plan:/.test(line)) return "console-plan";
  if (/^\s*\+/.test(line)) return "console-add";
  if (/^\s*-/.test(line)) return "console-remove";
  if (/^\s*~/.test(line)) return "console-change";
  return "";
}

export default function RequestConsole({ requestId, status }) {
  const [lines, setLines] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLogs = () => {
      getRequestLogs(requestId)
        .then(data => { if (!cancelled) setLines(data.logs || []); })
        .catch(() => {});
    };

    fetchLogs();
    const interval = IN_FLIGHT.includes(status) ? setInterval(fetchLogs, 1500) : null;

    return () => { cancelled = true; if (interval) clearInterval(interval); };
  }, [requestId, status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);

  return (
    <div className="console-panel">
      {lines.length === 0 ? (
        <div className="console-line console-muted">No output yet — nothing has been run for this request.</div>
      ) : (
        lines.map((line, i) => <div className={`console-line ${classifyLine(line)}`} key={i}>{line}</div>)
      )}
      <div ref={bottomRef} />
    </div>
  );
}
