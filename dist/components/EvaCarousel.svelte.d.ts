export interface CarouselSlide {
    src: string;
    caption: string;
    code?: string;
}
interface Props {
    slides?: CarouselSlide[];
}
declare const EvaCarousel: import("svelte").Component<Props, {}, "">;
type EvaCarousel = ReturnType<typeof EvaCarousel>;
export default EvaCarousel;
