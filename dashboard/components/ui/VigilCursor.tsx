"use client";

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './VigilCursor.css';

const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"], [contenteditable=""]';

const VigilCursor: React.FC<{
  targetSelector?: string;
  hideDefaultCursor?: boolean;
}> = ({
  targetSelector = 'button, a, select, input, textarea, [contenteditable], .cursor-target',
  hideDefaultCursor = true,
}) => {
  const cursorRef  = useRef<HTMLDivElement>(null);
  const coreRef    = useRef<HTMLDivElement>(null);
  const diamondRef = useRef<HTMLDivElement>(null);
  const ibeamRef   = useRef<HTMLDivElement>(null);
  const ringRef    = useRef<HTMLDivElement>(null);
  const barTopRef  = useRef<HTMLDivElement>(null);
  const barBotRef  = useRef<HTMLDivElement>(null);
  const breathTl   = useRef<gsap.core.Timeline | null>(null);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return true;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen  = window.innerWidth <= 768;
    const ua             = navigator.userAgent || navigator.vendor || '';
    const isMobileUA     = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUA;
  }, []);

  const moveCursor = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, { x, y, duration: 0.1, ease: 'power3.out' });
  }, []);

  const startBreathing = useCallback((diamond: HTMLDivElement) => {
    breathTl.current?.kill();
    breathTl.current = gsap
      .timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      .to(diamond, { scale: 1.22, duration: 1.3 });
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const cursor  = cursorRef.current!;
    const core    = coreRef.current!;
    const diamond = diamondRef.current!;
    const ibeam   = ibeamRef.current!;
    const ring    = ringRef.current!;
    const barTop  = barTopRef.current!;
    const barBot  = barBotRef.current!;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = 'none';

    gsap.set(cursor,  { x: -200, y: -200 });
    gsap.set(diamond, { xPercent: -50, yPercent: -50, rotation: 45, scale: 1, opacity: 1 });
    gsap.set(ring,    { scale: 0, opacity: 0 });
    gsap.set(ibeam,   { opacity: 0 });
    gsap.set([barTop, barBot], { scaleX: 0, opacity: 0 });

    startBreathing(diamond);

    let activeTarget: Element | null      = null;
    let leaveHandler: (() => void) | null = null;

    const detach = (target: Element) => {
      if (leaveHandler) target.removeEventListener('mouseleave', leaveHandler);
      leaveHandler = null;
    };

    const restoreDiamond = () => {
      gsap.killTweensOf(diamond);
      gsap.to(diamond, {
        scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2.2)',
        onComplete: () => startBreathing(diamond),
      });
    };

    const onMove = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', onMove);

    const onDown = () => {
      gsap.killTweensOf([ring, core]);
      gsap.to(core, { scale: 0.72, duration: 0.1, ease: 'power2.in' });
      gsap.fromTo(ring,
        { scale: 0.3, opacity: 1 },
        { scale: 3.2, opacity: 0, duration: 0.55, ease: 'power2.out' }
      );
    };
    const onUp = () => {
      gsap.to(core, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' });
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);

    const onOver = (e: MouseEvent) => {
      const el     = e.target as Element;
      const target = el.closest(targetSelector) as Element | null;
      if (!target || target === activeTarget) return;
      if (activeTarget) detach(activeTarget);
      activeTarget = target;

      const isText = !!el.closest(TEXT_SELECTOR);
      const rect   = target.getBoundingClientRect();

      breathTl.current?.pause();
      gsap.killTweensOf(diamond);

      gsap.killTweensOf([barTop, barBot]);

      if (isText) {
        gsap.to(diamond, { scale: 0, opacity: 0, duration: 0.15, ease: 'power2.in' });
        gsap.to([barTop, barBot], { scaleX: 0, opacity: 0, duration: 0.15 });
        gsap.to(ibeam, { opacity: 1, duration: 0.2 });
      } else {
        gsap.to(diamond, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' });
        gsap.to(ibeam,   { opacity: 0, duration: 0.1 });

        gsap.set(barTop, { x: rect.left, y: rect.top    - 1, width: rect.width, transformOrigin: 'left center', scaleX: 0, opacity: 0 });
        gsap.set(barBot, { x: rect.left, y: rect.bottom + 1, width: rect.width, transformOrigin: 'left center', scaleX: 0, opacity: 0 });
        gsap.to(barTop, { scaleX: 1, opacity: 0.95, duration: 0.28, ease: 'power2.out' });
        gsap.to(barBot, { scaleX: 1, opacity: 0.95, duration: 0.28, ease: 'power2.out', delay: 0.04 });
      }

      leaveHandler = () => {
        activeTarget = null;
        gsap.to(ibeam, { opacity: 0, duration: 0.15 });
        gsap.killTweensOf([barTop, barBot]);
        gsap.to([barTop, barBot], { scaleX: 0, opacity: 0, duration: 0.22, ease: 'power2.in' });
        restoreDiamond();
        detach(target);
      };
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', onOver as EventListener);

    return () => {
      breathTl.current?.kill();
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseover',  onOver as EventListener);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
      if (activeTarget) detach(activeTarget);
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, hideDefaultCursor, isMobile, moveCursor, startBreathing]);

  if (isMobile) return null;

  return (
    <>
      <div ref={cursorRef} className="vigil-cursor">
        <div ref={coreRef} className="vigil-cursor-core">
          <div ref={diamondRef} className="vigil-diamond" />
          <div className="vigil-dot" />
        </div>
        <div ref={ibeamRef} className="vigil-ibeam" />
        <div ref={ringRef}  className="vigil-ring"  />
      </div>
      <div ref={barTopRef} className="vigil-bar" />
      <div ref={barBotRef} className="vigil-bar" />
    </>
  );
};

export default VigilCursor;
