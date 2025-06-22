const seasonReelId = "season-reel"
const seasonReelTextId = "season-reel-text"
const episodeReelId = "episode-reel"
const episodeReelTextId = "episode-reel-text"

function rollPart1(number, duration) {
  return {
    number,
    animation: [
      { top: "-40%" },
      { top: "20%" },
    ],
    timing: {
      duration: duration,
      iterations: 1,
      easing: "ease-out",
    }
  }
}

function rollPart2(number, duration) {
  return {
    number,
    animation: [
      { top: "15%" },
      { top: "75%" },
    ],
    timing: {
      duration: duration,
      iterations: 1,
      easing: "ease-in",
    }
  }
}

const slotAnimationCount = 20
function slotAnimation(initial, result, randomMin, randomMax) {
  const animations = []

  animations.push(
    rollPart2(initial, 300)
  )

  for (i = 0; i < slotAnimationCount; i++) {
    const number = Math.floor(Math.random() * (randomMax - randomMin) + randomMin)
    animations.push(
      rollPart1(number, 100),
      rollPart2(number, 100),
    )
  }

  animations.push(rollPart1(result, 400))

  return animations
}

function runSlotAnimations(animations, element, elementText, onFinish) {
  if (animations.length == 0) {
    if (onFinish) {
      onFinish()
    }

    return
  }

  elementText.innerHTML = animations[0].number

  const animation = element
    .animate(
      animations[0].animation,
      animations[0].timing
    )

  animation.onfinish = _ =>
    runSlotAnimations(
      animations.slice(1),
      element,
      elementText,
      onFinish
    )
}

const minSeason = 1
const maxSeason = Math.max(...episodes.map(e => e.season))

function clickedSpin() {
  console.log("Clicked spin!")

  const episodeTitle = document.getElementById("episode-title")
  const episodeDescription = document.getElementById("episode-description")

  episodeTitle.innerHTML = "..."
  episodeDescription.innerHTML = "."

  const resultSeason = Math.floor(Math.random() * ((maxSeason + 1) - minSeason) + minSeason)

  const minEpisode = 1
  const maxEpisode = Math.max(...episodes.filter(e => e.season === resultSeason).map(e => e.episode))

  const resultEpisodeNumber = Math.floor(Math.random() * ((maxEpisode + 1) - minEpisode) + minEpisode)

  const resultEpisode = episodes.find((e) => e.season === resultSeason && e.episode === resultEpisodeNumber)

  const seasonFrames = slotAnimation(1, resultSeason, 1, maxSeason + 1)
  const episodeFrames = slotAnimation(1, resultEpisodeNumber, 1, maxEpisode + 1)

  const spinButton = document.getElementById("spinButton")
  spinButton.disabled = true

  const seasonReel = document.getElementById(seasonReelId)
  const seasonReelText = document.getElementById(seasonReelTextId)
  const episodeReel = document.getElementById(episodeReelId)
  const episodeReelText = document.getElementById(episodeReelTextId)

  runSlotAnimations(
    seasonFrames,
    seasonReel,
    seasonReelText,
    () => {
      runSlotAnimations(
        episodeFrames,
        episodeReel,
        episodeReelText,
        () => {
          spinButton.disabled = false
          if (resultEpisode) {
            episodeTitle.innerHTML = resultEpisode.title
            episodeDescription.innerHTML = resultEpisode.description
          }
        }
      )
    }
  )
}
