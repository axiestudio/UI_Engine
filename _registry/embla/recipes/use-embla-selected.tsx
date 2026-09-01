/**
 * Registry recipe — Embla Carousel: selected-snap wiring.
 * The one effect every carousel needs: which snap is active, how many exist,
 * and whether prev/next are possible. Events are always paired on/off.
 *
 * Engine library — NOT vendored code. `embla-carousel-react` stays an npm peer.
 * Usage:
 *   const [emblaRef, embla] = useEmblaCarousel({ align: "center", containScroll: "keepSnaps" })
 *   const { selectedIndex, snapCount, canPrev, canNext } = useEmblaSelected(embla)
 */
import * as React from "react"
import type { UseEmblaCarouselType } from "embla-carousel-react"

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>

export function useEmblaSelected(embla: EmblaApi | undefined) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [snapCount, setSnapCount] = React.useState(0)
  const [canPrev, setCanPrev] = React.useState(false)
  const [canNext, setCanNext] = React.useState(false)

  const onSelect = React.useCallback((api: EmblaApi) => {
    setSelectedIndex(api.selectedScrollSnap())
    setCanPrev(api.canScrollPrev())
    setCanNext(api.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!embla) return
    // reInit fires when slides resize / are added — snap list can change
    const onReInit = (api: EmblaApi) => {
      setSnapCount(api.scrollSnapList().length)
      onSelect(api)
    }
    setSnapCount(embla.scrollSnapList().length)
    onSelect(embla)
    embla.on("select", onSelect).on("reInit", onReInit)
    return () => {
      embla.off("select", onSelect).off("reInit", onReInit)
    }
  }, [embla, onSelect])

  return { selectedIndex, snapCount, canPrev, canNext }
}
