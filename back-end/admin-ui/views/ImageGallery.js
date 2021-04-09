/** @jsx jsx */
import {jsx} from '@emotion/core';
import {useAdminMeta} from "@keystonejs/app-admin-ui/client/providers/AdminMeta";
import {ListProvider} from '@keystonejs/app-admin-ui/client/providers/List';
import {useList} from "@keystonejs/app-admin-ui/client/providers/List";
import './gallery.css'
import {AddNewItem} from "@keystonejs/app-admin-ui/components/index";
import CreateItemModal from "@keystonejs/app-admin-ui/client/components/CreateItemModal";
import CreateItem from "@keystonejs/app-admin-ui/client/pages/List/CreateItem";

const ListPage = (props) => {
    console.log('props', props);
    const {listData: {items: images1}} = useList();
    console.log('it', images);
    const baseUrl = 'http://localhost:3000/files/';

    if (!images1 || !images1.length) {
        return 'no image'
    }
    const images = Array.from(images1).sort( () => .5 - Math.random() );
    let cols = [];
    const cols_count = 4;
    for (let i = 0; i < images.length; i++) {
        let current_col = i % cols_count;
        if (!cols[current_col]) {
            cols[current_col] = [];
        }
        cols[current_col].push(images[i]);
    }
    return <div>
        <div className="top">
           <div>
               <h2>Gallery</h2>
               <h4 className="total">
                   <span className="count">{images.length} </span>
                   Images
               </h4>
           </div>
            <CreateItem />

        </div>
        <div className="row">
            {cols.map((col_images, index) =>
                <div key={index} className="column">
                    {col_images.map((image,index)=>
                        <img key={index} src={baseUrl + image.file.filename}/>
                    )}
                </div>
            )}
        </div>

    </div>
}

const ImageGallery = () => {
    const adminMeta = useAdminMeta();
    console.log('adminMeta', adminMeta);
    const listKey = 'Image';
    const list = adminMeta.getListByKey(listKey);
    console.log('list', list);
    return <ListProvider key={listKey} list={list}>
        <ListPage/>
        <CreateItemModal viewOnSave />
    </ListProvider>
}

export default ImageGallery;