import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { complete } from './commands';

const LEVEL = {
  SYS: 'text-subtle',
  INFO: 'text-muted',
  OK: 'text-ok',
  WARN: 'text-amber-500',
  ERR: 'text-red-500',
  CMD: 'text-accent',
};

export const fmtClock = (ms) => {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;
};

export const EventLog = ({ entries }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div ref={ref} className="h-full overflow-y-auto px-3 py-2 font-mono text-[11px] leading-[1.7]" aria-live="polite">
      {entries.map((e) => (
        <div key={e.id} className="flex gap-2">
          <span className="shrink-0 tabular-nums text-subtle/70">{fmtClock(e.t)}</span>
          <span className={`w-9 shrink-0 ${LEVEL[e.level] || 'text-muted'}`}>{e.level === 'CMD' ? '$' : e.level}</span>
          <span className={`min-w-0 break-words ${e.level === 'CMD' ? 'text-ink' : 'text-muted'}`}>{e.msg}</span>
        </div>
      ))}
    </div>
  );
};

export const CommandLine = forwardRef(({ onSubmit, suggestions, projectIds }, ref) => {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);
  const [cursor, setCursor] = useState(-1);

  const submit = (text) => {
    const v = text.trim();
    if (!v) return;
    onSubmit(v);
    setHistory((h) => [...h.filter((x) => x !== v), v].slice(-30));
    setCursor(-1);
    setValue('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(value);
    } else if (e.key === 'Tab') {
      const next = complete(value, projectIds);
      if (next !== value) {
        e.preventDefault();
        setValue(next);
      }
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const i = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i]);
    } else if (e.key === 'ArrowDown' && cursor >= 0) {
      e.preventDefault();
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(-1);
        setValue('');
      } else {
        setCursor(i);
        setValue(history[i]);
      }
    } else if (e.key === 'Escape') {
      setValue('');
      e.currentTarget.blur();
    }
  };

  return (
    <div className="border-t border-line">
      {suggestions.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 pt-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="shrink-0 rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10.5px] text-muted transition-colors hover:border-accent/50 hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 px-3 py-2.5 font-mono text-xs transition-colors focus-within:bg-raised/50">
        <span className="text-accent" aria-hidden="true">
          $
        </span>
        <span className="sr-only">Console command</span>
        <input
          ref={ref}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setCursor(-1);
          }}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          placeholder='type "help" or a node name…'
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-subtle/70 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <kbd className="hidden rounded border border-line px-1 text-[10px] text-subtle xl:inline">/</kbd>
      </label>
    </div>
  );
});
CommandLine.displayName = 'CommandLine';
