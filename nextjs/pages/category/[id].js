import Head from "next/head";
import React from "react";
import DefaultErrorPage from 'next/error'
import {fetchQuery} from "../../lib/Fetch";
import {AuthSection, Category} from "../index";


export default function ({category}) {
    if (!category) {
        return '';
    }
    return (
        <div className="index_page container mb-5">
            <header>
                <nav>
                    <div className="d-flex py-5">
                        <h1 className="header-text">
                            Speak Lab
                        </h1>
                        <div className="ml-auto">
                            {/*   <AuthSection/>*/}
                        </div>
                    </div>
                </nav>
            </header>
            <div>
                <Category category={category} showAll={true}/>
            </div>
        </div>
    );
};

export async function getStaticProps({params}) {
    let id = params.id;
    const query = `
    query{
        category : Category(where:{id:"${id}"}){
            name
            public
            id
            createdAt
            
            lessons(sortBy: createdAt_DESC) {
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
                    name
                    public
                    id
                    createdAt
                }
            }
        }
    }`

    const {category} = await fetchQuery(query)
    return {
        props: {category},
        revalidate: 1,
    }
}

export async function getStaticPaths() {
    const paths = [];
    return {
        paths,
        fallback: true,
    }
}
