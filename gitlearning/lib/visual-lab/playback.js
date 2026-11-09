export const initialPlayback = (cursor = 0) => ({
  cursor,
  playing: false,
  speed: 1,
  replay: 0,
  beat: -1,
  explaining: false,
});
const speeds = [0.5, 1, 1.5, 2];

export function playbackReducer(state, action) {
  const last = Math.max(0, action.last ?? state.cursor);
  const clamp = (cursor) =>
    Math.max(
      0,
      Math.min(last, Number.isFinite(cursor) ? Math.floor(cursor) : 0),
    );
  switch (action.type) {
    case "toggle":
      return {
        ...state,
        playing: state.cursor < last && !state.playing,
        explaining: !state.playing && state.beat >= 0,
      };
    case "pause":
      return state.playing || state.explaining
        ? { ...state, playing: false, explaining: false }
        : state;
    case "next":
      return {
        ...state,
        cursor: clamp(state.cursor + 1),
        playing: false,
        beat: 0,
        explaining: true,
      };
    case "previous":
      return {
        ...state,
        cursor: clamp(state.cursor - 1),
        playing: false,
        beat: -1,
        explaining: false,
      };
    case "seek":
      return {
        ...state,
        cursor: clamp(action.cursor),
        playing: false,
        beat: -1,
        explaining: false,
      };
    case "restart":
      return {
        ...initialPlayback(),
        speed: state.speed,
        replay: state.replay + 1,
      };
    case "replay":
      return {
        ...state,
        playing: false,
        replay: state.replay + 1,
        beat: 0,
        explaining: true,
      };
    case "resume-explanation":
      return { ...state, explaining: state.beat >= 0 };
    case "beat":
      if (!state.explaining) return state;
      return state.beat + 1 < action.count
        ? { ...state, beat: state.beat + 1 }
        : { ...state, beat: -1, explaining: false };
    case "settle":
      return { ...state, beat: -1, explaining: false };
    case "speed":
      return speeds.includes(action.speed)
        ? { ...state, speed: action.speed }
        : state;
    case "tick": {
      if (!state.playing) return state;
      const cursor = clamp(state.cursor + 1);
      const stopped = action.stops?.includes(cursor);
      return {
        ...state,
        cursor,
        playing: cursor < last && !stopped,
        beat: stopped ? -1 : 0,
        explaining: !stopped,
      };
    }
    default:
      return state;
  }
}
