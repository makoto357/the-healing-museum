import Link from "next/link";
import { useState, useContext, useEffect, use } from "react";
import { ThemeColorContext } from "../context/ColorContext";
import {
  collection,
  onSnapshot,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  Timestamp,
  orderBy,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { numberInputAnatomy } from "@chakra-ui/anatomy";

interface IUser {
  email: string | undefined;
  favoriteArtworksID: string[] | undefined;
  favoritePostsID: string[] | undefined;
  id: string | undefined;
  last_changed: Timestamp | undefined;
  name: string | undefined;
  visitorJourney: EnumJourneyItems | undefined;
}

interface EnumJourneyItem {
  recommendedArtist: string;
  quizPoints: number;
  quizDate: Timestamp;
}

interface IArtwork {
  artistName: string | undefined;
  completionYear: number | undefined;
  title: string | undefined;
  id: string | undefined;
  image: string | undefined;
}
interface EnumJourneyItems extends Array<EnumJourneyItem> {}
export default function UserProfile() {
  const [themeColor] = useContext(ThemeColorContext);
  const { user } = useAuth();
  const [profile, setProfile] = useState<IUser>({
    email: undefined,
    favoriteArtworksID: undefined,
    favoritePostsID: undefined,
    id: undefined,
    last_changed: undefined,
    name: undefined,
    visitorJourney: undefined,
  });
  const [artwork, setArtwork] = useState<IArtwork>({
    artistName: undefined,
    completionYear: undefined,
    title: undefined,
    id: undefined,
    image: undefined,
  });

  console.log();
  useEffect(() => {
    // const getQuote = async () => {
    //   const res = await fetch(
    //     "https://api.api-ninjas.com/v1/quotes?category=art",
    //     {
    //       method: "GET",
    //       headers: new Headers({
    //         "X-Api-Key": "1nczSYeTEucsj0UZ9JE2xQ==nX2o1snyqlWSIlp5",
    //         contentType: "application/json",
    //       }),
    //     }
    //   );

    // success: function (result) {
    //   console.log(result);
    // },
    // error: function ajaxError(jqXHR) {
    //   console.error("Error: ", jqXHR.responseText);
    // },

    // const options = {
    //   method: "GET",
    //   headers: {
    //     "X-RapidAPI-Key":
    //       "09a3fc9c23mshc493a2d797b26d2p164126jsn3f42286223f2",
    //     "X-RapidAPI-Host": "andruxnet-random-famous-quotes.p.rapidapi.com",
    //   },
    // };

    // const res = await fetch(
    //   "https://andruxnet-random-famous-quotes.p.rapidapi.com/?cat=design&count=10",
    //   options
    // );
    //   const results = await res.json();
    //   console.log(results);
    // };
    // getQuote();

    const getProfile = async () => {
      const q = query(collection(db, "users"), where("id", "==", user?.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const IUser = doc.data() as IUser;
        setProfile(IUser);
        console.log(
          IUser.visitorJourney[IUser.visitorJourney.length - 1]
            .recommendedArtist
        );

        const artworkID =
          IUser.favoriteArtworksID[IUser.favoriteArtworksID.length - 1];

        console.log(
          IUser.favoriteArtworksID[IUser.favoriteArtworksID.length - 1]
        );
        getFavoriteArtwork(artworkID);
      });
    };
    const getFavoriteArtwork = async (id) => {
      console.log(id);
      const q = query(collection(db, "artists"), where("id", "==", id));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => doc.data() as any);
      setArtwork(docs[0]);
      console.log(docs[0].image);
    };
    if (user) {
      getProfile();
    }
  }, [user]);
  return (
    <>
      <div>profile</div>
      <div style={{ textAlign: "right" }}>
        <Link href="/visitor-posts">
          <p>check posts of other visitors.</p>
        </Link>
      </div>
      <section>
        <p>
          Thank you, {profile?.name}, for your visit to the Healing Museum
          today. I hope you had a nice time and some understandings of{" "}
          {artwork.artistName} whose life perspectives resonate with your own.
        </p>
        <p>
          This artwork below is the last one you saved as favorite during your
          journey, does it remind you of a special moment in your life?
        </p>
        <p>
          No matter what you have encountered, we hope this painting gives you
          strength, for knowing you are not alone.
        </p>
        <img alt={artwork.id} src={artwork.image} />
        {/* <p>{quote}</p> */}
        <p>We feel, therefore we are.</p>
      </section>
      <div
        style={{ background: themeColor, height: "100px", width: "100px" }}
      ></div>
    </>
  );
}

// export async function getStaticProps() {
//   const options = {
//     method: "GET",
//     headers: {
//       "X-RapidAPI-Key": "09a3fc9c23mshc493a2d797b26d2p164126jsn3f42286223f2",
//       "X-RapidAPI-Host": "theysaidso.p.rapidapi.com",
//     },
//   };

//   const res = fetch(
//     "https://theysaidso.p.rapidapi.com/quote/search?query=art&maxlength=500&author=Klimt&minlength=10&language=en",
//     options
//   );

//   return {
//     props: { results: results },
//     revalidate: 10,
//   };
// }
