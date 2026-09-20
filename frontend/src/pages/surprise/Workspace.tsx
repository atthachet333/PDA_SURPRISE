import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PortalTransition } from '@/components/surprise/PortalTransition';
import { WorldGateway } from '@/components/surprise/WorldGateway';
import { anniversary } from '@/data/anniversary';
import { useAudio } from '@/app/audioContext';
import { formatMemoryDate } from '@/lib/memoryGate';
import { usePageMeta } from '@/hooks/usePageMeta';
import { privateMeta } from '@/lib/seo';

/**
 * /workspace — the crossing.
 *
 * WHAT THIS REPLACED
 *
 * A corporate-looking screen that ran three invented access checks ("Checking
 * device", "Verifying access", "Loading private workspace"), listed one private
 * project, and offered a button. It worked, but it read as a second continue
 * screen after the memory gate: you proved you knew the date, and then you
 * waited for a fake progress list to finish before you were allowed in.
 *
 * It is now the route out of the public world and into the private one —
 * PDA WORLD → OUR WORLD → A&I WORLD. The sequence that used to be pretend
 * loading is now the thing actually being said.
 *
 * WHAT DELIBERATELY DID NOT CHANGE
 *
 *   - The route itself, and both guards on it. A fresh session still cannot
 *     reach this screen without passing the gate.
 *   - The audio lifecycle. `unlock()` + `prepare()` on mount create the ONE
 *     music instance and warm it without playing a note, and the button is
 *     still the single gesture that starts playback — synchronously, inside
 *     the click, which is the only thing iOS Safari accepts.
 *   - The portal handoff into /us.
 *
 * No corporate header, footer, nav or contact dock is mounted here. PDA WORLD
 * is a narrative place, not the public shell.
 */
export default function Workspace() {
  usePageMeta(privateMeta);

  const location = useLocation();
  const navigate = useNavigate();
  const { play, unlock, prepare, start } = useAudio();
  const [leaving, setLeaving] = useState(false);

  const registration = formatMemoryDate(anniversary.relationship.registrationDate);

  /**
   * The gateway is the last screen before the story, so it is where the audio
   * gets ready.
   *
   * `unlock()` re-arms the context (the login gesture already opened it; this
   * also covers a visitor who landed here directly). `prepare()` creates the
   * ONE music instance and pulls its metadata, so the track is warm by the time
   * the visitor reaches the button — without playing a note and without
   * blocking this screen from rendering.
   */
  useEffect(() => {
    unlock();
    prepare();
  }, [prepare, unlock]);

  /**
   * Consume the memory-gate handoff once, so a refresh or a back navigation
   * never replays it. The gateway shows the verified date as a status line
   * rather than as its own full-screen beat — one screen, not two.
   */
  useEffect(() => {
    if (!(location.state as { memoryGateReveal?: boolean } | null)?.memoryGateReveal) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  /**
   * The one gesture that opens the story — and therefore the one place the
   * music is allowed to begin.
   *
   * Everything audio-related happens SYNCHRONOUSLY here, inside the gesture
   * chain. Nothing is awaited: `start()` returns immediately whether the file
   * is loaded, still buffering or missing entirely, so the portal and the
   * navigation that follows never wait on audio.
   */
  const onEnter = useCallback(() => {
    if (leaving) return;
    unlock();
    start();
    play('softClick');
    setLeaving(true);
  }, [leaving, play, start, unlock]);

  /**
   * Tell the story HOW the visitor arrived.
   *
   * Someone who came through the gateway has just watched a four-second
   * crossing and a three-and-a-half-second portal. Replaying the arrival's full
   * staged intro on top of that makes the ceremony land three times in a row —
   * measured, it put the first actionable moment in /us nine seconds after this
   * button was pressed. Scene01 uses this flag to arrive already underway.
   *
   * Someone who opens /us directly gets the full arrival, unchanged.
   */
  const onTransitionComplete = useCallback(() => {
    navigate('/us', { replace: true, state: { fromGateway: true } });
  }, [navigate]);

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-navy-900 text-ivory">
      {/*
        The ground the crossing happens on: structured at the origin, open at
        the destination. A grid that only exists on the PDA side, and a sky glow
        that only exists on the A&I side, with the two overlapping in the middle
        where OUR WORLD sits. Static CSS — no canvas, no shader, nothing that
        needs a frame to be correct.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hairline-grid opacity-[0.18] [mask-image:linear-gradient(to_right,black,transparent_62%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_82%_50%,rgba(126,200,255,0.16),transparent_70%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_18%_50%,rgba(53,201,111,0.07),transparent_72%)]"
      />

      <WorldGateway
        onEnter={onEnter}
        leaving={leaving}
        verifiedLabel={`${registration.english} · ${registration.thai}`}
      />

      <PortalTransition active={leaving} onComplete={onTransitionComplete} />
    </main>
  );
}
