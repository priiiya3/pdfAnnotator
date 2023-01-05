import {Document, Page, pdfjs} from 'react-pdf/dist/esm/entry.webpack5'
import {useState, useEffect} from 'react'
import './PDF.css'
import CrossLogo from './cross.png'
import { GetPageYCoordinateRelativeDocument, GetPageHeight} from './DocPageHelper.js'
import { SaveLocalStorage, GetLocalStorage, KeyExists } from './LocalStorage'

const url = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
pdfjs.GlobalWorkerOptions.workerSrc = url

const labels = [
    {
        label:"Title",
        color:"#fc7020"
    },
    {
        label:"Author",
        color:"#51bd42"
    }
]

function PDF(props){

    const [docWidth, setDocWidth] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [annotations, updateAnnotations] = useState([])
    const [selectedLabel, setSelectedLabel] = useState(null)
    
    useEffect(()=>{
        function setWidth(){
            let docElement = document.getElementById(props.id);
            let docRect = docElement.getBoundingClientRect();

            setDocWidth(docRect.width);
        }

        setWidth()
        window.addEventListener("resize", setWidth);

        function PageMouseDown(e){
            if(!selectedLabel){
                return;
            }
            let page = e.currentTarget;
            let pageClientRect = page.getBoundingClientRect()
            if(!page.annotationProps){
                page.annotationProps = {}
            }

            page.annotationProps.down = true;

            page.annotationProps.start = {
                x: (e.clientX - pageClientRect.left)/pageClientRect.width,
                y: (e.clientY - pageClientRect.top)/pageClientRect.height
            } 

            let box = document.createElement("div");
            box.className = "annotation-box annotation-box-move";

            box.style.left = `${e.clientX-pageClientRect.left}px`
            box.style.top = `${e.clientY-pageClientRect.top}px`
            
            page.appendChild(box)
        }

        function PageMouseMove(e){
            let page = e.currentTarget;
            if(!(page.annotationProps && page.annotationProps.down)){
                return;
            }

            let pageClientRect = page.getBoundingClientRect()

            let box = page.querySelector(".annotation-box-move");

            let width = (e.clientX - pageClientRect.left) - page.annotationProps.start.x*pageClientRect.width
            let height = (e.clientY - pageClientRect.top) - page.annotationProps.start.y*pageClientRect.height

            box.style.width = `${Math.abs(width)}px`;
            box.style.height = `${Math.abs(height)}px`;
            if(width < 0){
                box.style.left = `${e.clientX-pageClientRect.left}px`
            }
            if(height < 0){
                box.style.top = `${e.clientY-pageClientRect.top}px`
            } 
        }

        function PageMouseUp(e){
            let page = e.currentTarget;
            if(!(page.annotationProps && page.annotationProps.down)){
                return;
            }
            let pageClientRect = page.getBoundingClientRect()

            page.annotationProps.down = false;

            page.annotationProps.end = {
                x: (e.clientX - pageClientRect.left)/pageClientRect.width,
                y: (e.clientY - pageClientRect.top)/pageClientRect.height
            } 

            let tempS = {...page.annotationProps.start}
            let tempE = {...page.annotationProps.end}

            page.annotationProps.start.x = Math.min(tempS.x, tempE.x);
            page.annotationProps.start.y = Math.min(tempS.y, tempE.y);
            page.annotationProps.end.x = Math.max(tempS.x, tempE.x);
            page.annotationProps.end.y = Math.max(tempS.y, tempE.y);

            page.querySelector(".annotation-box-move").remove();

            if(page.annotationProps.end.x-page.annotationProps.start.x < 0.03 && page.annotationProps.end.y-page.annotationProps.start.y < 0.03){
                return;
            }
            let newArr = annotations.slice()
            newArr.push({
                start:page.annotationProps.start,
                end:page.annotationProps.end,
                pageIndex: page.pageIndex,
                label: selectedLabel
            })
            SaveLocalStorage(props.id, newArr)
            updateAnnotations(newArr)
        }

        for(let i = 0; i < totalPages; i++){
            let page = document.getElementById(props.id).querySelector(`.${props.id}_page_${i}`);
            if(page){
                page.pageIndex = i;
                page.addEventListener("mousedown", PageMouseDown);
                page.addEventListener("mousemove", PageMouseMove)
                page.addEventListener("mouseup", PageMouseUp);   
            }
            
        }

        return ()=>{
            window.removeEventListener("resize", setWidth)
            for(let i = 0; i < totalPages; i++){
                let page = document.getElementById(props.id).querySelector(`.${props.id}_page_${i}`);
                if(page){
                    page.removeEventListener("mousedown", PageMouseDown);
                    page.removeEventListener("mousemove", PageMouseMove)
                    page.removeEventListener("mouseup", PageMouseUp);   
                }
            }
        }
    })

    useEffect(()=>{ 
        function RemoveAnnotationBoxes(){
            let allBoxes = document.getElementById(props.id).querySelectorAll(`.annotation-box`);   
            for(let box of allBoxes){
                box.remove();
            }
        }
        function AppendAnnotationBoxes(){
            RemoveAnnotationBoxes()
            for(let annotation of annotations){
                let page = document.getElementById(props.id).querySelector(`.${props.id}_page_${annotation.pageIndex}`);
                if(page){

                    let annotationBox = document.createElement("div");
                    annotationBox.className = "annotation-box"
                    annotationBox.style.left = `${(annotation.start.x)*docWidth}px`;
                    annotationBox.style.top = `${(annotation.start.y)*GetPageHeight(props.id, annotation.pageIndex)}px`;
                    annotationBox.style.height = `${(annotation.end.y-annotation.start.y)*GetPageHeight(props.id, annotation.pageIndex)}px`;
                    annotationBox.style.width = `${(annotation.end.x-annotation.start.x)*docWidth}px`;
                    annotationBox.style.backgroundColor = `${annotation.label.color}`
                    annotationBox.style.borderColor = `${annotation.label.color}`

    
                    page.appendChild(annotationBox)
                }
            }
        }


        AppendAnnotationBoxes();
        window.addEventListener("resize", AppendAnnotationBoxes);
    
        return ()=>{
            window.removeEventListener("resize", AppendAnnotationBoxes);
        }
        
    }, [annotations, docWidth])

    return (
        <div className='doc-annotations-container'>
            <div className='annotations-window'>
                <div className='label-selection-container'>
                     <h3>Labels</h3>
                     <div className='normal-divider'></div>
                     <div className='label-choices-container'>
                        {
                            labels.map((label)=>{
                                return (
                                    <div key={label.label}
                                        onClick={()=>{
                                            setSelectedLabel(label)
                                        }}
                                        className={`label btn ${(selectedLabel&&selectedLabel.label==label.label)?"selected-label":""}`}
                                        style={{
                                            backgroundColor:label.color
                                        }}>
                                            {label.label}
                                    </div>
                                )
                            })
                        }
                     </div>
                     
                </div>
                <div className='boxes-display-container'>
                    <h3>Boxes</h3>
                    <div className='normal-divider'></div>
                    <table className='boxes-info-table'>
                        <tbody>
                            {
                                annotations.map((annotation, index)=>{
                                    return (
                                        <tr key={`${annotation.label.label}_${annotation.start.x}_${annotation.start.y}`}>
                                            <td>
                                                <span>x: {(annotation.start.x*docWidth).toFixed(2)}, y: {(annotation.start.y*GetPageHeight(props.id, annotation.pageIndex) + GetPageYCoordinateRelativeDocument(props.id, annotation.pageIndex)).toFixed(2)}</span>
                                            </td>
                                            <td>
                                                <span>height: {((annotation.end.y-annotation.start.y)*GetPageHeight(props.id, annotation.pageIndex)).toFixed(2)}, width: {((annotation.end.x-annotation.start.x)*docWidth).toFixed(2)}</span>
                                            </td>
                                            <td>
                                                <div className='label'
                                                    style={{
                                                        backgroundColor:annotation.label.color
                                                    }}>
                                                        {annotation.label.label}
                                                </div>
                                            </td>
                                            <td>
                                                <img src={CrossLogo}
                                                    width="40px"
                                                    className='btn'
                                                    onClick={()=>{
                                                        let arr = [...annotations]
                                                        arr.splice(index, 1);
                                                        SaveLocalStorage(props.id, arr)
                                                        updateAnnotations(arr);
                                                    }}/>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='document-window'>
                <div id={props.id}
                     className="document-container">
                    <Document file={props.file}
                            onLoadSuccess={(pdf)=>{
                                setTotalPages(pdf.numPages)
                            }}
                            className={`${props.id}_document`}>
                        {
                            Array.from(Array(totalPages).keys()).map((num)=>{
                                return (
                                    <Page pageNumber={num+1}
                                        width={docWidth}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className={`${props.id}_page_${num}`}
                                        key={`pageno_${num}`}
                                        onRenderSuccess={()=>{
                                            // setPagesLoaded(true)
                                            updateAnnotations(KeyExists(props.id)?GetLocalStorage(props.id):[])
                                        }}/>
                                )
                            })
                        }
                    </Document>
                </div>
            </div>
            
        </div>
        
    )
}

export default PDF;