import React, { useState } from "react";
import Head from "next/head";
import "./Player.module.scss";
import Plyr from "plyr";
import SubtitleList from "./player/SubtitlesList";
import LineModal from "./player/LineModal";
import { HotKeys } from "react-hotkeys";
import { loadGetInitialProps } from "next/dist/next-server/lib/utils";
import next from "next";

const Mousetrap = require("mousetrap");

export default class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state.subtitles = JSON.parse(props.lesson.subtitle.subtitles);
  }

  componentDidMount() {
    const long_lesson = +this.props.lesson.sound.duration.split(":")[1] > 5;
    this.setState({
      skipSilence: Boolean(localStorage.getItem("skipSilence") || long_lesson),
    });
    this.setState({
      silenceDuration: localStorage.getItem("skipSilenceDuration")
        ? +JSON.parse(localStorage.getItem("skipSilenceDuration"))
        : 1000,
    });
    if (!this.props.lesson) {
      return;
    }
    const controls = [
      "play-large", // The large play button in the center
      // 'restart', // Restart playback
      "rewind", // Rewind by the seek time (default 10 seconds)
      "play", // Play/pause playback
      "fast-forward", // Fast forward by the seek time (default 10 seconds)
      "progress", // The progress bar and scrubber for playback and buffering
      // 'current-time', // The current time of playback
      // 'duration', // The full duration of the media
      "mute", // Toggle mute
      "volume", // Volume control
      // 'captions', // Toggle captions
      "settings", // Settings menu
      //'pip', // Picture-in-picture (currently Safari only)
      //'airplay', // Airplay (currently Safari only)
      // 'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
      "fullscreen", // Toggle fullscreen
    ];

    this.player = new Plyr("#player", { controls });
    this.player.on("ready", () => {
      this.setState({
        ready: true,
      });
    });
    const self = this;
    let busy = null;
    this.player.on("timeupdate", (...args) => {
      try {
        const { currentTime } = this.player;
        if (this.state.repeatMode) {
          const current = self.getCurrentSubtitle();
          const currentIndex = self.getCurrentIndex();
          if (current && !busy) {
            busy = current.text;
            const start = current.start / 1000;
            const now = currentTime;
            const end = current.end / 1000;
            const duration = current.end - current.start;
            setTimeout(() => {
              this.player.pause();
              setTimeout(() => {
                busy = null;
                this.player.play();
              }, duration + 1000);
            }, (end - now) * 500);
          }
        }
        if (currentTime) {
          this.setState({
            currentTime,
          });
        }
      } catch (e) {
        console.error(e);
      }
    });

    this.player.on("seeked", () => {
      resetLastScrollY();
      this.scrollToActiveRow();
    });

    this.player.on("ended", () => {
      resetLastScrollY();
    });

    Mousetrap.bind("shift+space", () => {
      this.player.togglePlay();
    });
    Mousetrap.bind("shift+right", () => {
      let next = this.getNextSubtitle();
      if (next) {
        this.player.currentTime = next.start / 1000;
        this.setState({ currentTime: next.start, selectedLine: next });
      }
    });
    Mousetrap.bind("shift+left", () => {
      let prev = this.getPreviousSubtitle();
      if (prev) {
        this.player.currentTime = prev.start / 1000;
        this.setState({ currentTime: prev.start, selectedLine: prev });
      }
    });
    Mousetrap.bind("ctrl+enter", () => {
      const current = this.getCurrentSubtitle() || this.state.selectedLine;
      if (current) {
        this.setState({ selectedLine: current }, () =>
          window.$("#line-modal").modal("toggle")
        );
      }
    });

    Mousetrap.bind("ctrl+shift+right", () => {
      let it = this.state.subtitles[this.getCurrentIndex() + 10];
      if (it) {
        this.player.currentTime = it.start / 1000;
        this.setState({ currentTime: it.start, selectedLine: it });
      }
    });
    Mousetrap.bind("ctrl+shift+left", () => {
      let it = this.state.subtitles[this.getCurrentIndex() - 10];
      if (it) {
        this.player.currentTime = it.start / 1000;
        this.setState({ currentTime: it.start, selectedLine: it });
      }
    });
  }

  getCurrentSubtitle = () => {
    const { currentTime, subtitles } = this.state;

    //   console.log('called');
    const currentMS = currentTime * 1000;
    //  console.log(currentMS, subtitles[0]);
    return (subtitles || []).filter((it) => {
      return currentMS >= it.start && currentMS <= it.end;
    });
  };
  getNextSubtitle = (current) => {
    const { currentTime, subtitles } = this.state;
    const currentMS = currentTime * 1000;
    let list = this.state.subtitles || [];
    return list.find((it) => it.start > currentMS);
  };
  getPreviousSubtitle = () => {
    console.log("getPreviousSubtitle() called");
    const { currentTime, subtitles } = this.state;
    const currentMS = currentTime * 1000;
    let list = this.state.subtitles || [];
    let currentIndex = list.findIndex(
      (it) => it.end > currentMS && it.start < currentMS
    );
    ("");
    return list[currentIndex - 1];
  };
  getCurrentSubtitle = (current) => {
    const { currentTime, subtitles } = this.state;
    const currentMS = currentTime * 1000;
    let list = this.state.subtitles || [];
    return list.find((it) => it.end > currentMS && it.start < currentMS);
  };

  getCurrentIndex = (current) => {
    const { currentTime, subtitles } = this.state;
    const currentMS = currentTime * 1000;
    let list = this.state.subtitles || [];
    return list.findIndex((it) => it.end > currentMS && it.start < currentMS);
  };

  state = {
    ready: false,
    subtitles: [],
    autoScroll: true,
    showSettings: false,
    skipSilence: true,
    silenceDuration: 1000,
    selectedLine: null,
    repeatMode: false,
    lastSubIndex: null,
  };

  render() {
    // console.log('player render method called()', this.props);
    try {
      if (!this.props.lesson) {
        return "something went wrong!";
      }
    } catch (e) {
      console.error(e);
    }
    if (!this.props.lesson) {
      return "Lessons was null!";
    }

    const { lesson } = this.props;
    //  console.log('lesson is:', lesson);
    const {
      name: title,
      image: { url: imageUrl },
      sound: { url: soundUrl },
    } = lesson;
    const { silenceDuration, currentTime, subtitles: subs } = this.state;
    const {
      autoScroll,
      showSettings,
      skipSilence,
      repeatMode,
      lastSubIndex,
    } = this.state;

    let currentMs = currentTime * 1000;
    const subtitles = subs.map((it, index) => {
      it.active = currentMs >= it.start && currentMs <= it.end;
      return it;
    });

    const { previous_lesson_id, next_lesson_id } = this.props;

    const currentSubIndex = subtitles.findIndex((it) => it.active);
    const lastSubtitle = subtitles[lastSubIndex];
    const nextSubtitle = subtitles[lastSubIndex + 1];

    /* if (currentSubIndex && currentSubIndex !== lastSubIndex) {
      if (
        typeof window !== undefined &&
        this.player &&
        lastSubtitle &&
        nextSubtitle
      ) {
        console.log("finished line:", lastSubtitle.text, nextSubtitle.text);
        try {
          const duration = lastSubtitle.end - lastSubtitle.start;
          console.log("waiting for ", duration);
          this.player.pause();
          setTimeout(() => {
            this.player.currentTime =( nextSubtitle.start + 1) / 1000;

            this.player.play();
          }, duration);
        } catch (error) {
          console.error(error);
        }
      }
      this.setState({ lastSubIndex: currentSubIndex });
    } */

    return (
      <>
        <Head>
          <link href="/plyr.css" rel="stylesheet" />
          {/* <link href="https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.6.1/css/bootstrap4-toggle.min.css" rel="stylesheet"/>
                    <script src="https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.6.1/js/bootstrap4-toggle.min.js"></script>*/}
        </Head>
        <div className={"my-container " + (showSettings ? "showSettings" : "")}>
          <div className={"top_container"}>
            <div className={"top_background"}>
              {imageUrl && <img src={imageUrl} />}
            </div>
            <div
              id="scroll-div"
              className={
                "container " + "scroll_section" + " " + "textContainer"
              }
            >
              <h2 className={"noselect pb-3 mb-3"}>{title}</h2>

              <SubtitleList
                skipSilence={skipSilence}
                onItemClick={(item) =>
                  (this.player.currentTime = item.start / 1000)
                }
                onItemDoubleClick={(item) => {
                  this.setState({ selectedLine: item }, () =>
                    window.$("#line-modal").modal("show")
                  );
                }}
                currentMs={currentMs}
                subtitles={subtitles}
                seekTo={(it) => (this.player.currentTime = it)}
              />

              <div className="row text-light w-100 mx-5">
                <div className="col-12 col-sm-6">
                  {previous_lesson_id && (
                    <div className="w-100 h-100">
                      <a
                        href={"/lessons/" + previous_lesson_id}
                        className="w-100 link text-light"
                      >
                        <div className="prev-btn justify-content-center">
                          <img
                            src="/icons/skip_previous-white-18dp.svg"
                            alt=""
                          />
                          <p>Previous</p>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
                <div className="col-12 col-sm-6">
                  {next_lesson_id && (
                    <div className=" w-100 h-100">
                      <a
                        href={"/lessons/" + next_lesson_id}
                        className="w-100 link text-light"
                      >
                        <div className="next-btn  justify-content-center ">
                          <p>Next</p>
                          <img src="/icons/skip_next-white-18dp.svg" alt="" />
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              className={
                "icon-toggle-settings " + (showSettings ? "active" : "")
              }
              onClick={() => this.setState({ showSettings: !showSettings })}
            >
              <img src="https://img.icons8.com/ios/24/ffffff/menu-2.png" />
            </div>
          </div>
          <div className="controls h-6 d-flex px-3 bg-white align-items-center">
            <div
              className="d-flex align-items-center pointer"
              onClick={() => this.setState({ autoScroll: !autoScroll })}
            >
              <div
                className={
                  "btn " +
                  (autoScroll ? "btn-outline-success" : "btn-outline-secondary")
                }
              >
                Auto Scroll
              </div>
            </div>
            <div
              className="d-flex align-items-center ml-3 pointer "
              onClick={() => this.onToggleSkipSilence(skipSilence)}
            >
              <div
                className={
                  "btn " +
                  (skipSilence
                    ? "btn-outline-success"
                    : "btn-outline-secondary")
                }
              >
                Skip Silence
              </div>
            </div>
            {skipSilence && (
              <div className="d-flex align-items-center ml-3 pointer ">
                <p className="mb-0 mr-2">Duration</p>
                <input
                  type="number"
                  value={silenceDuration}
                  style={{ maxWidth: 90 }}
                  onChange={(e) => this.setDuration(e)}
                />
              </div>
            )}
            <div
              className="d-flex align-items-center pointer ml-3"
              onClick={() => this.setState({ repeatMode: !repeatMode })}
            >
              <div
                className={
                  "btn " +
                  (repeatMode ? "btn-outline-success" : "btn-outline-secondary")
                }
              >
                Repeat Mode
              </div>
            </div>
          </div>
        </div>
        <div className={"bottom_player"}>
          <audio id="player" controls className="mt-10">
            {soundUrl && <source src={soundUrl} type="audio/mp3" />}
          </audio>
        </div>
        <LineModal selectedLine={this.state.selectedLine} />
      </>
    );
  }

  setDuration(e) {
    let value = e.target.value;
    this.setState({ silenceDuration: value });
    if (typeof window !== "undefined") {
      localStorage.setItem("skipSilenceDuration", JSON.stringify(value));
    }
  }

  onToggleSkipSilence(skipSilence) {
    let it = !skipSilence;
    this.setState({ skipSilence: it });
    if (typeof window !== "undefined") {
      if (it) {
        localStorage.setItem("skipSilence", "yeah!");
      } else {
        localStorage.removeItem("skipSilence");
      }
    }
  }

  componentDidUpdate() {
    const { autoScroll } = this.state;
    if (autoScroll && !is_scrolling()) {
      this.scrollToActiveRow();
    }
  }

  scrollToActiveRow = () => {
    const active_row = document.querySelector("." + "row_active");
    // console.log('active_row is:', active_row);
    const div = document.getElementById("scroll-div");
    // console.log('scrol-div is', div);
    if (active_row) {
      const e_top = active_row.offsetTop;
      const div_half = div.offsetHeight / 2;
      let scroll_to_y = e_top > div_half ? e_top - div_half : 0;
      //  console.log('scroll target', scroll_to_y);
      if (window.lastScrollY && scroll_to_y < window.lastScrollY) {
        console.log("scroll back cancelled");
        return;
      }
      // console.log(' --- > scrolling to y:', scroll_to_y);
      div.scroll({
        top: scroll_to_y,
        behavior: "smooth",
      });
      window.lastScrollY = scroll_to_y;
    }
  };

  seekToText(it) {
    const previousTime = this.player.currentTime;
    const padding_ms = 500;
    // console.log("currentTime", this.state.currentTime);
    // console.log('it.start', it.start);
    let start = it.start > padding_ms ? it.start - padding_ms : it.start;
    let target = start / 1000;
    // console.log('target', target);
    this.player.currentTime = target;
    this.player.play();
    setTimeout(() => {
      this.player.pause();
      this.player.currentTime = it.start / 1000;
    }, it.end - it.start + padding_ms);

    for (let i = 0; i <= padding_ms; i += 100) {
      let percent = i / padding_ms;
      setTimeout(() => (this.player.volume = percent), i);
    }
  }
}

function is_scrolling() {
  return (
    window.lastScrollTime && new Date().getTime() < window.lastScrollTime + 999
  );
}

function isHidden(el) {
  return el.offsetParent === null;
}

function scrollToElm(container, elm, duration) {
  var pos = getRelativePos(elm);
  scrollTo(container, pos.top, 2); // duration in seconds
}

function getRelativePos(elm) {
  var pPos = elm.parentNode.getBoundingClientRect(), // parent pos
    cPos = elm.getBoundingClientRect(), // target pos
    pos = {};

  pos.top = cPos.top - pPos.top + elm.parentNode.scrollTop;
  pos.right = cPos.right - pPos.right;
  pos.bottom = cPos.bottom - pPos.bottom;
  pos.left = cPos.left - pPos.left;

  return pos;
}

function scrollTo(element, to, duration, onDone) {
  var start = element.scrollTop,
    change = to - start,
    startTime = performance.now(),
    val,
    now,
    elapsed,
    t;

  function animateScroll() {
    now = performance.now();
    elapsed = (now - startTime) / 1000;
    t = elapsed / duration;

    element.scrollTop = start + change * easeInOutQuad(t);

    if (t < 1) window.requestAnimationFrame(animateScroll);
    else onDone && onDone();
  }

  animateScroll();
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function checkInView(container, element, partial) {
  //Get container properties
  let cTop = container.scrollTop;
  let cBottom = cTop + container.clientHeight;

  //Get element properties
  let eTop = element.offsetTop;
  let eBottom = eTop + element.clientHeight;

  //Check if in view
  let isTotal = eTop >= cTop && eBottom <= cBottom;
  let isPartial =
    partial &&
    ((eTop < cTop && eBottom > cTop) || (eBottom > cBottom && eTop < cBottom));

  //Return outcome
  return isTotal || isPartial;
}

function ensureInView(container, element) {
  //Determine container top and bottom
  let cTop = container.scrollTop;
  let cBottom = cTop + container.clientHeight;

  //Determine element top and bottom
  let eTop = element.offsetTop;
  let eBottom = eTop + element.clientHeight;

  //Check if out of view
  if (eTop < cTop) {
    container.scrollTop -= cTop - eTop;
  } else if (eBottom > cBottom) {
    container.scrollTop += eBottom - cBottom;
  }
}

function resetLastScrollY() {
  window.lastScrollY = null;
  // console.log('reset last scroll called');
}
