import styled from "@emotion/styled";

import Link from "next/link";
import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import heart from "../asset/heart.png";
import commentIcon from "../asset/comments.svg";
import { useAuth } from "../context/AuthContext";

const MainContainer = styled.section`
  display: flex;
  max-width: 1200px;
  width: 65vw;
  margin: 70px auto;
  row-gap: 50px;
  column-gap: 20px;
`;

const CommentContainer = styled.section`
  width: 270px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  background: white;

  position: relative;
  transition: all 0.5s ease;
  filter: grayscale(100%);

  &:before {
    z-index: -1;
    background: white;

    position: absolute;

    content: "";
    height: calc(100% - 40px);
    width: 100%;
    bottom: -40px;
    left: 0;
    -webkit-transform-origin: 0 0;
    -ms-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: skewY(-4deg);
    -ms-transform: skewY(-4deg);
    transform: skewY(-4deg);
  }
  &:hover {
    filter: grayscale(0%);
    &:before {
      z-index: -1;
      background: white;

      position: absolute;

      content: "";
      height: 100%;
      width: 100%;
      bottom: -40px;
      left: 0;
      -webkit-transform-origin: 0 0;
      -ms-transform-origin: 0 0;
      transform-origin: 0 0;
      -webkit-transform: skewY(-4deg);
      -ms-transform: skewY(-4deg);
      transform: skewY(-4deg);
      box-shadow: 5px 5px 20px #888888;
    }
  }
`;

const Post = styled.section`
  margin: 20px 20px 0px;
`;
const MainImage = styled.div`
  width: 100%;
  min-height: 70px;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
`;
const CollectionButton = styled.div`
  background-image: url(${heart.src});
  width: 20px;
  height: 20px;
  background-size: cover;
`;

const CommentButton = styled.div`
  background-image: url(${commentIcon.src});
  width: 20px;
  height: 20px;
  background-size: cover;
`;

const TextArea = styled.textarea`
  border: 1px solid #2c2b2c;
  padding: 5px;
  width: 100%;
`;

const Split = styled.div`
  border-bottom: 1px solid #2c2b2c;
  margin-bottom: 20px;
`;

let comments: Array<{
  commentTime: Timestamp;
  commentatorId: string;
  commentatorName: string;
  content: string;
}> = [];

interface IComment {
  id: string | undefined;
  comments;
}

export default function VisitorPosts() {
  const [posts, setPosts] = useState([]);
  const [showComment, setShowComment] = useState(false);
  const [postComments, setPostComments] = useState<IComment>({
    id: undefined,
    comments,
  });
  const commentRef = useRef(null);

  console.log("");
  const { user } = useAuth();
  useEffect(() => {
    const colRef = collection(db, "user-posts");
    const unSubscribe = onSnapshot(colRef, (snapshot) => {
      let posts = [];
      snapshot.docs.forEach((doc) => {
        posts.push({
          ...doc.data(),
        });
      });
      setPosts(posts);
    });
    return () => {
      unSubscribe();
    };
  }, []);

  const saveToFavorites = async (id) => {
    const requestRef = doc(db, "users", user?.uid);
    return await updateDoc(requestRef, {
      favoritePostsID: arrayUnion(id),
    });
  };

  const handleShowComments = (singlePost) => {
    setPostComments(singlePost);
    setShowComment(true);
  };

  const handleComment = async (singlePost) => {
    console.log(singlePost.id);
    console.log(commentRef.current.value);
    const requestRef = doc(db, "user-posts", singlePost.id);
    await updateDoc(requestRef, {
      comments: arrayUnion({
        commentatorId: user.uid,
        commentTime: new Date(),
        content: commentRef.current.value,
      }),
    });
    commentRef.current.value = "";
    // base on singlePost id, update postComments
  };
  return (
    <>
      <MainContainer>
        {posts.map((post) => (
          <CommentContainer key={post.id}>
            <MainImage>
              <img alt={post.title} src={post.uploadedImage} />
            </MainImage>
            <Post>
              <Text>
                <div>
                  <h1>
                    <strong>{post.title}</strong>
                  </h1>
                  <p>{post.date}</p>
                </div>
                <p>{post.textContent}</p>
                <div>
                  <p>
                    <strong>Posted by: </strong>
                    {post.postMadeBy}
                  </p>
                  <p>
                    <strong>Artist: </strong>
                    {post.artistForThisVisit}
                  </p>
                </div>
              </Text>
              <ButtonGroup>
                <CommentButton
                  role="button"
                  onClick={() => handleShowComments(post)}
                ></CommentButton>
                <CollectionButton
                  role="button"
                  onClick={() => saveToFavorites(post.id)}
                ></CollectionButton>
              </ButtonGroup>
            </Post>
            {showComment && postComments?.id === post?.id && (
              <Post>
                <Split></Split>
                <TextArea
                  placeholder="After reading this post, I feel..."
                  name="visitorComment"
                  ref={commentRef}
                />
                <button type="button" onClick={() => handleComment(post)}>
                  submit
                </button>
              </Post>
            )}
            {showComment && postComments?.id === post.id && (
              <Post>
                <strong>How Others Feel</strong>
              </Post>
            )}
            {showComment &&
              postComments?.id === post.id &&
              postComments?.comments?.map((c) => (
                <>
                  <Post key={c.commentTime}>
                    <h1></h1>
                    <p>{c.commentatorName}</p>
                    <p>{c.content}</p>
                  </Post>
                </>
              ))}
          </CommentContainer>
        ))}
      </MainContainer>
    </>
  );
}
