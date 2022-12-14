import styled from "@emotion/styled";
import React, { useContext } from "react";
import { createPortal } from "react-dom";
import { ThemeColorContext } from "../context/ColorContext";

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  background-color: rgba(0, 0, 0, 0.2);
`;

const ModalContentBackdrop = styled.div<{ $colorCode: string }>`
  position: relative;
  max-width: 90vw;
  height: 94vh;
  margin: 3vh auto 0;
  background: ${(props) => props.$colorCode};
`;

const ModalContent = styled.div<{ $colorCode: string }>`
  position: relative;
  padding: 24px 32px 40px;
  max-width: 90vw;
  height: 94vh;
  background: ${(props) => props.$colorCode};
  border: 1px solid black;
`;

function ArtworkModal({ children }: { children: React.ReactNode }) {
  const { themeColor } = useContext(ThemeColorContext);

  return createPortal(
    <ModalBackdrop>
      <ModalContentBackdrop
        $colorCode={themeColor ? `${themeColor.secondary}` : "#eeece5"}
      >
        <ModalContent $colorCode={themeColor ? `${themeColor}` : "#eeece5"}>
          {children}
        </ModalContent>
      </ModalContentBackdrop>
    </ModalBackdrop>,
    document.getElementById("modal-root")!
  );
}
export default ArtworkModal;
