import styled from "@emotion/styled";
import Link from "next/link";
import React from "react";
import SignpostButton from "../components/Button";
import select from "../asset/selection-box.png";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import filledHeart from "../asset/black-heal.png";
import unfilledHeart from "../asset/white-heal.png";
import ArtworkModal from "../components/ArtworkModal";
import close from "../asset/cancel.png";
import artistStyle from "../public/visitorJourney.json";
import upArrow from "../asset/arrow-up.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface Prop {
  $heart?: string;
}
const ArtworkGrid = styled.section`
  margin: 0 auto 60px;
  width: 90vw;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`;

const CloseIcon = styled.div`
  background-image: url(${close.src});
  background-size: cover;
  width: 25px;
  height: 25px;
  position: fixed;
  top: 1rem;
  right: 1.5rem;
  @media screen and (max-width: 500px) {
    right: 0.5rem;
  }
`;

const Content = styled.div`
  display: flex;
  height: 100%;
  @media screen and (max-width: 500px) {
    flex-direction: column;
    justify-content: flex-start;
  }
`;

const Text = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 36px;
`;

const Figure = styled.figure`
  height: 100%;
  width: 100%;
  display: flex;
  max-height: calc(100vh - 12rem);
`;

const FavoritesIcon = styled.div<{ $heart: string }>`
  background-image: url(${(props) => props.$heart});
  width: 30px;
  height: 30px;
  background-size: cover;
`;

const ToTop = styled.div`
  position: fixed;
  bottom: 60px;
  right: 3vw;
  text-align: center;
  @media screen and (max-width: 800px) {
    bottom: 60px;
  }
`;
const BackToTop = styled.div`
  background-image: url(${upArrow.src});
  width: 30px;
  height: 30px;
  background-size: cover;
  margin: auto;
`;

const ArtworkImage = styled.img`
  display: block;
  width: 100%;
  max-height: inherit;
  object-fit: contain;
  object-position: center;
  margin-bottom: auto;
`;

const Frame = styled.figure<{ $highlightedBorder: string }>`
  border: ${(props) => props.$highlightedBorder};
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

function ArtWork({
  onClick,
  imgSrc,
  width = "320",
  height = "427",
  favorite,
  artworkInfo,
}) {
  return (
    <div onClick={onClick}>
      <Frame
        $highlightedBorder={
          favorite?.includes(artworkInfo.id) ? "8px solid #bbb6ac" : "none"
        }
      >
        <img width={width} height={height} src={imgSrc} alt="" />
      </Frame>
    </div>
  );
}

const ARTWORK_STYLE = {
  0: { width: "640", height: "1138" },
  1: { width: "640", height: "427" },
  2: { width: "320", height: "427" },
};

export default function Masonry() {
  const { user } = useAuth();
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState<IModalInfo>({
    id: undefined,
    title: undefined,
    url: undefined,
    artistUrl: undefined,
    artistName: undefined,
    artistId: undefined,
    completitionYear: undefined,
    width: undefined,
    height: undefined,
    image: undefined,
  });
  const [favorite, setFavorite] = useState([]);
  console.log(favorite);
  interface IModalInfo {
    id: string | undefined;
    title: string | undefined;
    url: string | undefined;
    artistUrl: string | undefined;
    artistName: string | undefined;
    artistId: string | undefined;
    completitionYear: number | undefined;
    width: number | undefined;
    height: number | undefined;
    image: string | undefined;
  }

  const getModalInfo = (artwork) => {
    setShowModal(true);
    setModalInfo(artwork);
  };
  useEffect(() => {
    const getArtist = async () => {
      const q = query(collection(db, "users"), where("id", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => doc.data() as any);
      setFavorite(docs[0].favoriteArtworksID);
      getArtworks(
        docs[0].visitorJourney[docs[0].visitorJourney.length - 1]
          .recommendedArtist
      );
    };
    getArtist();

    const getArtworks = async (artist) => {
      const q = query(
        collection(db, "artists"),
        where("artistUrl", "==", artist),
        orderBy("completitionYear", "desc")
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs?.map((doc) => doc.data());
      const setsOfartworks = sdivceIntoChunks(docs, 11);
      setArtworks(setsOfartworks);

      function sdivceIntoChunks(arr, chunkSize) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
          const chunk = arr.slice(i, i + chunkSize);
          res.push(chunk);
        }
        return res;
      }
    };
    getArtist();
  }, [user.uid]);
  const saveToFavorites = async (id) => {
    console.log(modalInfo.id);
    setFavorite((prev) => [...prev, modalInfo.id]);
    const requestRef = doc(db, "users", user?.uid);
    return await updateDoc(requestRef, {
      favoriteArtworksID: arrayUnion(modalInfo.id),
    });
  };

  const deleteFromFavorites = async (id) => {
    const index = favorite.indexOf(id);
    favorite.splice(index, 1);
    console.log(favorite);
    setFavorite([...favorite]);
    const requestRef = doc(db, "users", user?.uid);
    return await updateDoc(requestRef, {
      favoriteArtworksID: arrayRemove(modalInfo.id),
    });
  };
  return (
    <>
      <div
        style={{
          width: "80vw",
          margin: "0 auto",
          padding: "40px 0 0px",
        }}
      >
        <ToastContainer
          position="top-center"
          // autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <h1>
          <strong>
            Save your favorite artwork by clicking on the heart icon, before you
            leave for the next gallery.
          </strong>
        </h1>
        <br />
        <p>
          {artworks &&
            artistStyle?.filter(
              (location) => location?.artistUrl === artworks[0]?.[0].artistUrl
            )[0]?.artistStyle}
        </p>
      </div>
      <div className="container">
        <ul>
          <li>
            <div
              className="animated-arrow"
              onClick={() => {
                if (favorite.length == 0) {
                  toast(
                    "Please select your favorite artwork before you leave this gallery.",
                    {
                      position: "top-center",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "light",
                      icon: ({ theme, type }) => <img src={select.src} />,
                    }
                  );
                } else {
                  router.push("/artist-video");
                }
              }}
            >
              <span className="the-arrow -left">
                <span className="shaft"></span>
              </span>
              <span className="main">
                <span className="text">Hear about the artist</span>
                <span className="the-arrow -right">
                  <span className="shaft"></span>
                </span>
              </span>
            </div>
          </li>
        </ul>
      </div>

      <ToTop
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }}
      >
        <BackToTop />
        <div>
          <strong>
            To
            <br /> Top
          </strong>
        </div>
      </ToTop>

      <ArtworkGrid>
        {artworks?.map((setOfartwork, i) => (
          <ul key={i} className="grid">
            {setOfartwork.map((artWork, index) => {
              const { width, height } = ARTWORK_STYLE[index] ?? {}; //fallback to no value oif there's no image
              return (
                <ArtWork
                  favorite={favorite}
                  artworkInfo={artWork}
                  key={artWork.image}
                  onClick={() => {
                    getModalInfo(artWork);
                  }}
                  width={width}
                  height={height}
                  imgSrc={artWork.image}
                />
              );
            })}
          </ul>
        ))}
      </ArtworkGrid>
      <div>
        {showModal && (
          <ArtworkModal>
            <CloseIcon role="button" onClick={() => setShowModal(false)} />
            <Content>
              <Text>
                <h1>
                  <strong>{modalInfo.title}</strong>
                </h1>
                <p>
                  {modalInfo.artistName}, {modalInfo.completitionYear}
                  <br />
                  {modalInfo.width} X {modalInfo.height} cm
                </p>
                <FavoritesIcon
                  $heart={
                    favorite?.includes(modalInfo.id)
                      ? `${filledHeart.src}`
                      : `${unfilledHeart.src}`
                  }
                  role="button"
                  onClick={() => {
                    if (!favorite.includes(modalInfo.id))
                      saveToFavorites(modalInfo.id);
                    else if (favorite.includes(modalInfo.id)) {
                      deleteFromFavorites(modalInfo.id);
                    }
                  }}
                ></FavoritesIcon>
              </Text>

              <Figure>
                <ArtworkImage alt={modalInfo.title} src={modalInfo.image} />
              </Figure>
            </Content>
          </ArtworkModal>
        )}
      </div>
    </>
  );
}
