import {useEffect, useState} from "react";
import Highlightable from 'highlightable';
import {fetchQuery} from "../../lib/Fetch";
import * as axios from "axios";

export default function LineModal(props) {
    const {selectedLine} = props;
    if (!selectedLine) return null;
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [translation, setTranslation] = useState(null);
    const [cancelToken, setCancelToken] = useState(null);
    const [currentSelection, setCurrentSelection] = useState(null);

    let onTextHighlightedCallback = async (arg1) => {
        console.log("onTextHighlightedCallback", arguments);
        if (typeof document !== "undefined") {
            const string = typeof arg1 === 'string' ? arg1 : document.getSelection().toString();
            setCurrentSelection(string);
            console.log('selected text is:', string);
            const word = string
            setResult(null)
            setLoading(true);
            setError(null);
            setTranslation(null);
            try {
                if (cancelToken && cancelToken.cancel) {
                    cancelToken.cancel("Operation canceled due to new request.");
                }

                let source = axios.CancelToken.source();
                setCancelToken(source)
                let {getDefinition: {result, error, translation}} = await fetchQuery(`
                    query($word: String!){
                        getDefinition(word: $word,lang: "en"){
                            result
                            error
                            translation
                        }
                    }
                `, {word}, source.token);
                console.log(result, error);
                if (result) {
                    result = JSON.parse(result);
                    setResult(result)
                }
                if (error) {
                    error = JSON.parse(error);
                    setError(error);
                }
                if (translation) {
                    translation = JSON.parse(translation);
                    setTranslation(translation)
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
    };

    let onMouseOverHighlightedWordCallback = () => {
        console.log("onMouseOverHighlightedWordCallback", arguments);
    };
    useEffect(() => {
        console.log('fucking calling it');
        if (!loading && !currentSelection && !result) {
            setCurrentSelection(selectedLine.text);
        }
    },[]);

    return (<div>
        <div className="modal" tabIndex="-1" id="line-modal" data-keyboard="false" data-backdrop="static">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Select to translate</h5>
                        {/*<button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>*/}
                    </div>
                    <div className="modal-body">
                        {selectedLine && selectedLine.text && selectedLine.text.length &&
                        <Highlightable
                            enabled={true}
                            onTextHighlighted={onTextHighlightedCallback}
                            onMouseOverHighlightedWord={onMouseOverHighlightedWordCallback}
                            highlightStyle={{
                                backgroundColor: '#ffcc80'
                            }}
                            text={selectedLine.text}

                            ranges={[]}
                        />}

                        <div className="form-group mt-3 w-100">
                            <textarea cols={1} className="w-100" placeholder="Define Something Else?"
                                      onChange={(e) => onTextHighlightedCallback(e.target.value.trim())}/>
                        </div>
                        <br/>
                        {loading && <p>Loading ...</p>}
                        <br/>

                        {translation && <p>
                            <p dir="rtl" className="text-right text-primary">{translation.text}</p>
                        </p>}
                        {result && !error &&
                        <WordDefinition onTextHighlightedCallback={onTextHighlightedCallback} result={result}/>}
                        <a className="text-primary"
                           href={`https://translate.google.com/?sl=auto&tl=fa&text=${currentSelection}&op=translate`}
                           target="_blank">
                            Google Translate
                        </a>
                        <br/>
                    </div>
                    <div className="modal-footer">
                        <button
                            onClick={() => {
                                setResult(null)
                                setLoading(false);
                                setError(null);
                                setTranslation(null);
                            }}
                            type="button" className="btn btn-secondary" data-dismiss="modal">Close
                        </button>
                        {/*<button type="button" className="btn btn-primary">Save changes</button>*/}
                    </div>
                </div>
            </div>
        </div>
    </div>);
}


function WordDefinition({result, onTextHighlightedCallback}) {
    if (!result) {
        return null;
    }
    return result.map(res => (
        <div>
            <h4 className="mt-4 d-inline" style={{borderBottom: '3px solid var(--primary)'}}>{res.word}</h4>
            {Object.keys(res.meaning).map(meaningKey => (
                <div className="mt-2">
                    <b className="text-primary ">{meaningKey}</b>
                    {res.meaning[meaningKey].map(meaning => (<div>
                        <h6 className="font-weight-bold">
                            {meaning.definition}
                        </h6>

                        {meaning.example && meaning.example.length > 0 &&
                        <p><b className="text-muted font-weight-light">- </b> {meaning.example}</p>}
                    </div>))}
                </div>))}
        </div>
    ))
}