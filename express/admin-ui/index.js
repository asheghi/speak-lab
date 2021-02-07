import Logo from "./views/Logo";
import CustomPage from "./views/CustomPage";
import About from "./views/About";
import ImageGallery from "./views/ImageGallery";
import DownloadLink from "./views/DownloadVideo";
import DownloadMp3 from "./views/DownloadMp3";
export default {
    /*  customToast,
      itemHeaderActions,
      listHeaderActions,
      listManageActions,
      logo,
      pages,*/
    logo: Logo,
    pages: () => [
        // Custom pages
        {
            label: 'Image Gallery',
            path: 'image-gallery',
            config:{},//these are props to be sent to ImageGallery component
            component: ImageGallery,
        },
        {
            label: 'About',
            path: 'about',
            component: About,
        },
        {
            label: 'DownloadLink',
            path: 'video-from-url',
            component: DownloadLink,
        },
        {
            label: 'Mp3 from link',
            path: 'mp3-from-url',
            component: DownloadMp3,
        },
        // Ordering existing list pages
        {
            label: 'English Stuff',
            children: [
                {listKey: 'Lesson'},
                {listKey: 'Category', label: 'Category'},
            ],
        }, {
            label:'Media Library',
            children:[
                {listKey: 'Sound'},
                {listKey: 'Image'},
                {listKey: 'Subtitle'},
            ]
        },
        {
            label: 'People',
            children: ['Artist','User'],
        },
    ],
};
