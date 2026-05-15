import React from 'react';

/* ─── Base Skeleton Block ─── */
function Bone({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

/* ─── Catalog Card Skeleton (Dashboard) ─── */
export function CatalogCardSkeleton() {
  return (
    <div className="bg-mi-surface border border-mi-border rounded-2xl p-5 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <Bone className="w-16 h-5" />
        <Bone className="w-20 h-5" />
      </div>
      <Bone className="w-3/4 h-6" />
      <Bone className="w-full h-4" />
      <Bone className="w-2/3 h-4" />
      <div className="flex gap-2 pt-2">
        <Bone className="w-14 h-6" />
        <Bone className="w-14 h-6" />
        <Bone className="w-14 h-6" />
      </div>
    </div>
  );
}

/* ─── Post Card Skeleton (Community Feed) ─── */
export function PostCardSkeleton() {
  return (
    <div className="bg-mi-surface border border-mi-border rounded-2xl overflow-hidden animate-fade-in">
      <div className="p-5 pb-0">
        <div className="flex items-start gap-3">
          <Bone className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Bone className="w-24 h-4" />
              <Bone className="w-8 h-4" />
            </div>
            <Bone className="w-16 h-3" />
          </div>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        <Bone className="w-4/5 h-5" />
        <Bone className="w-full h-4" />
        <Bone className="w-full h-4" />
        <Bone className="w-1/2 h-4" />
        <div className="flex gap-1.5 pt-1">
          <Bone className="w-16 h-6" />
          <Bone className="w-16 h-6" />
          <Bone className="w-16 h-6" />
        </div>
      </div>
      <div className="px-5 py-3 border-t border-mi-border/50 flex items-center justify-between">
        <div className="flex gap-1">
          <Bone className="w-14 h-7 rounded-lg" />
          <Bone className="w-14 h-7 rounded-lg" />
          <Bone className="w-14 h-7 rounded-lg" />
        </div>
        <Bone className="w-7 h-7 rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Stat Card Skeleton (Dashboard Stats) ─── */
export function StatCardSkeleton() {
  return (
    <div className="bg-mi-surface border border-mi-border rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Bone className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <Bone className="w-8 h-6" />
          <Bone className="w-16 h-3" />
        </div>
      </div>
    </div>
  );
}

/* ─── Publish Card Skeleton ─── */
export function PublishCardSkeleton() {
  return (
    <div className="bg-mi-surface border border-mi-border rounded-2xl p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Bone className="w-12 h-5" />
            <Bone className="w-16 h-5" />
          </div>
          <Bone className="w-3/4 h-5" />
          <Bone className="w-full h-4" />
        </div>
        <Bone className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  );
}

/* ─── Profile Skeleton ─── */
export function ProfileSkeleton() {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-mi-surface border border-mi-border rounded-2xl p-8">
        <div className="flex gap-6 items-center">
          <Bone className="w-20 h-20 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Bone className="w-48 h-7" />
            <Bone className="w-64 h-4" />
            <Bone className="w-32 h-3" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Bone className="w-32 h-5" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-mi-surface border border-mi-border rounded-xl p-4 text-center space-y-2">
              <Bone className="w-8 h-8 mx-auto" />
              <Bone className="w-6 h-5 mx-auto" />
              <Bone className="w-14 h-3 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
