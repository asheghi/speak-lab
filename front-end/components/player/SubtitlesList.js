export default function SubtitleList(props) {
  const {
    seekTo,
    subtitles,
    onItemClick,
    onItemDoubleClick,
    currentMs,
  } = props;
  const { skipSilence } = props;

  const indexActiveSub = subtitles.findIndex((it) => it.active);
  if (skipSilence && indexActiveSub < 0) {
    const next = subtitles.find((it) => it.start > currentMs);
    if (next && next.start - currentMs > 500) {
      seekTo(next.start / 1000);
    }
  }

  function formatText(text) {
    return String(text)
      .replace(/<[^>]*>/g, "")
      .replace(/=+/g, "");
  }

  return (
    <div>
      {subtitles.map((it) => {
        const rowStyle = "row_common";
        const activeStyle = "row_active";
        const inActiveStyle = "row_in_active";
        return (
          <div
            key={it.text + it.start + it.end}
            onDoubleClick={() => onItemDoubleClick(it)}
            onClick={() => onItemClick(it)}
            className={
              "row_common" +
              "  " +
              "noselect" +
              " " +
              (it.active ? activeStyle : inActiveStyle)
            }
          >
            {formatText(it.text)}
          </div>
        );
      })}
    </div>
  );
}
