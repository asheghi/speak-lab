import './index.module.scss';
import Link from "next/link";
import {fetchQuery} from "../lib/Fetch";
import './index.module.scss';
import useAuth from "../hooks/useAuth";
import {useState} from "react";

export function LessonItem(it, i) {
    const {id, name, sound: {duration}, image: {url: imageUrl}} = it;
    let artistName = it.artist ? it.artist.name : '';
    return <div key={i} className="lesson d-flex align-items-center mb-3">
        <img src={imageUrl}/>
        <div className="ml-4">
            <p className="name">{name}</p>
            <div className="d-flex">
                <p className="text-primary singer">{artistName}</p>
            </div>
        </div>
        <p className="ml-auto mr-3 text-muted">{duration && duration.length && duration.startsWith('00') ? duration.substr(3, duration.length) : duration}</p>
        <Link href={'/lessons/' + id}>
            <div className="btn btn-outline-primary px-4 mr-2 rounded-pill">Listen</div>
        </Link>
    </div>
}

export function Category({category,showAll}) {
    if (!category) {
        return '';
    }
    const {name, lessons} = category;
    return (<div className="category">
        <div className="d-flex align-items-center">
            <div className="category-name">{name}</div>
            {!showAll && lessons.length > 4 && <div className="ml-auto mr-3 text-primary">
                <a href={'/category/'+category.id} className="btn btn-outline-primary">
                    Show All
                </a>
            </div>}
        </div>
        {lessons.slice(0,showAll ? lessons.lenght : 4).map((it, i) => {
            return LessonItem(it, i);
        })}
    </div>);
}

export function AuthSection() {
    const {login, logout, user} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    if (user) {
        return <div>
            logged in as {user.email}
            <div className="btn btn-outline-danger ml-3"
                 onClick={() => logout()}
            >Log Out
            </div>
        </div>;
    }

    return <div>
        <div className="btn btn-outline-primary"
             data-toggle="modal" data-target="#loginModal"
        >sign-in
        </div>
        <div className="modal fade" id="loginModal" tabIndex="-1" role="dialog" aria-labelledby="loginModalLabel"
             aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="loginModalLabel">Sign-In</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form autoComplete="on">
                            <div className="form-group">
                                <label htmlFor="recipient-name" className="col-form-label">Email:</label>
                                <input value={email} onChange={(e) => setEmail(e.target.value)}
                                       autoComplete="email username" type="text" className="form-control"
                                       id="recipient-name"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="message-text" className="col-form-label">Password:</label>
                                <input value={password} onChange={e => setPassword(e.target.value)}
                                       autoComplete="old-password" type="password" className="form-control"/>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary"
                                data-dismiss="modal"
                        onClick={()=>login(email,password)}
                        >login</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default function Home({categories}) {
    console.log('got categories', typeof categories, categories);

    return (
        <div className="index_page container mb-5">
            <header>
                <nav>
                    <div className="d-flex py-5">
                        <h1 className="header-text">
                            Speak Lab
                        </h1>
                        <div className="ml-auto">
                            <AuthSection/>
                        </div>
                    </div>
                </nav>
            </header>
            <div>
                {categories && categories.length > 0 ? categories.map((it, i) => <Category category={it} key={i}/>) : 'No Category yet.'}
            </div>
        </div>
    )
}


export async function getStaticProps() {
    const ALL_CATEGORIES = `
    query {
      allCategories(where: { lessons_some: { id_not: null } }) {
        id
        name
        public
        lessons(sortBy: createdAt_DESC,first:5) {
          id
          name
          sound {
            duration
          }
          image {
            url
          }
          artist {
            name
          }
        }
      }
    }
    `
    const {allCategories} = await fetchQuery(ALL_CATEGORIES);

    return {
        props: {
            categories: Array.from(allCategories),
        },
        revalidate: 1, // In seconds
    }

}
