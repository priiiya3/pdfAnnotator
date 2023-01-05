import './App.css';
import PDF from './PDF.js'
import { useState, useEffect } from 'react';

// Import the sample pdfs provided
const documents = [
  {
    url:"https://arxiv.org/pdf/2212.08011.pdf",
    text:"Sample Document 1",
    hash:"#sample1",
    id:"pdf1"
  },
  {
    url:"https://arxiv.org/pdf/2212.07937.pdf",
    text:"Sample Document 2",
    hash:"#sample2",
    id:"pdf2"
  },
  {
    url:"https://arxiv.org/pdf/2212.07931.pdf",
    text:"Sample Document 3",
    hash:"#sample3",
    id:"pdf3"
  }
]

function App(){

  const [document, setDocument] = useState(null)
  useEffect(()=>{
    function PopFunc(e){
      e.preventDefault();
      if(!window.location.hash){
        setDocument(null);
        window.location.reload()
      }else{
        for(let d of documents){
          if(d.hash === window.location.hash){
            setDocument(d);
            break;
          }
        }
      }
    }
    window.addEventListener("popstate", PopFunc)
    return ()=>{
      return window.removeEventListener("popstate", PopFunc);
    }
  })

  return (
    <div className="App">
      {
        !document?<div>
          <h3>Documents</h3>
            <div className='normal-divider'
                style={{
                  width: "40%"
                }}></div>
            <ul>
              {
                documents.map((doc)=>{
                  return (
                    <li key={doc.text}>
                      <a onClick={()=>{
                        setDocument(doc)
                      }}
                        href={doc.hash}>{doc.text}</a>
                    </li>
                  )
                })
              }
            </ul>
        </div>:null
      }
      {
        document?<PDF file={document.url}
                      id={document.id}/>:null
      }
    </div>
  );
}

export default App;
