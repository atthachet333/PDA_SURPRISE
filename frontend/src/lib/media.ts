/** Keep private-memory playback exclusive without creating another audio bus. */
export function pauseOtherVideos(active: HTMLVideoElement): void {
  document.querySelectorAll<HTMLVideoElement>('video').forEach((video) => {
    if (video !== active && !video.paused) video.pause();
  });
}
