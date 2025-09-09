"use client";

import { KaitsukeCompleteModal } from "@/components/KaitsukeCompleteModal";

export default function ModalTest() {
  return (
    <div>
      <h1>Modal Test</h1>
      <KaitsukeCompleteModal
        isOpen={true}
        onClose={() => {}}
      />
    </div>
  );
}