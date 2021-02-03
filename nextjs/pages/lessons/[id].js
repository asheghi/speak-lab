import {useRouter} from "next/router";
import Player from "../../components/Player";
import Head from "next/head";
import React from "react";
import DefaultErrorPage from 'next/error'
import {fetchQuery} from "../../lib/Fetch";

const STRAPI_BACKEND_URL = process.env.STRAPI_BACKEND_URL;
const Lesson = ({lesson, baseUrlStorage, previous_lesson_id, next_lesson_id}) => {
    // This includes setting the noindex header because static files always return a status 200 but the rendered not found page page should obviously not be indexed
    if (!lesson) {
        return <>
            <Head>
                <meta name="robots" content="noindex"/>
                <title>Lesson Not Found!</title>
            </Head>
            <DefaultErrorPage statusCode={404}/>
        </>
    }

    return (
        <div>
            <Head>
                <title>{lesson.name}</title>
            </Head>
            <Player lesson={lesson} previous_lesson_id={previous_lesson_id}  next_lesson_id={next_lesson_id}/>
        </div>
    )
}

export default Lesson;

export async function getStaticProps({params}) {
    let id = params.id;
    const GET_LESSON = `
    query($id: ID!) {
      Lesson(where: { id: $id }) {
        id
        name
        updatedAt
        artist {
          name
        }
        subtitle {
          url
          subtitles
        }
        sound {
          url
        }
        image {
          url
        }
        category{
          lessons(sortBy:createdAt_DESC){
            name
            id
          }
        }
      }
    }`

    const res = await  fetchQuery(GET_LESSON,{id})
    const {Lesson : lesson,} = res;

    let previous_lesson_id = null;
    let next_lesson_id = null;

    try {
        const lessons = lesson.category.lessons;
        if (lesson.category && lessons) {
            const lesson_index = lessons.findIndex(it => it.id === lesson.id);
            if (lesson_index > 0) {
                previous_lesson_id = lessons[lesson_index - 1].id
            }
            if (lesson_index < lessons.length - 1) {
                next_lesson_id = lessons[lesson_index + 1].id
            }
        }
    } catch (e) {
        console.error(e);
    }

    return {
        props: {
            lesson,
            previous_lesson_id,
            next_lesson_id,
        },
        revalidate: 1,
    }
}


export async function getStaticPaths() {
    // Call an external API endpoint to get posts
    // const res = await fetch(STRAPI_BACKEND_URL + '/lessons');
    // const lessons = await res.json();

    // Get the paths we want to pre-render based on posts
    // const paths = lessons.map((it) => `/lessons/${it.id}`)
    const paths = [];
    // We'll pre-render only these paths at build time.
    // { fallback: false } means other routes should 404.

    return {
        paths,
        fallback: true,
    }
}
