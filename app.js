const seasonReelId = "season-reel"
const episodeReelId = "episode-reel"

function rollPart1(number, duration) {
  return {
    number,
    animation: [
      { top: "-60%" },
      { top: "30%" },
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
      { top: "30%" },
      { top: "120%" },
    ],
    timing: {
      duration: duration,
      iterations: 1,
      easing: "ease-in",
    }
  }
}

const slotAnimationCount = 30
function slotAnimation(initial, result, randomMin, randomMax) {
  const animations = []

  animations.push(
    rollPart2(initial, 300)
  )

  for (i = 0; i < slotAnimationCount; i++) {
    const number = Math.floor(Math.random() * (randomMax - randomMin) + randomMin)
    animations.push(
      rollPart1(number, 50),
      rollPart2(number, 50),
    )
  }

  animations.push(rollPart1(result, 400))

  return animations
}

const rotateAnimations = [
  {
    animation: [
      { top: "30%"},
      { top: "120%" },
    ],
    timing: {
      duration: 300,
      iterations: 1,
      easing: "ease-in",
    }
  },
  {
    animation: [
      { top: "-60%" },
      { top: "30%" },
    ],
    timing: {
      duration: 300,
      iterations: 1,
      easing: "ease-out",
    }
  }
]

function runSlotAnimations(animations, element, onFinish) {
  if (animations.length == 0) {
    if (onFinish) {
      onFinish()
    }

    return
  }

  element.innerHTML = animations[0].number

  const animation = element
    .animate(
      animations[0].animation,
      animations[0].timing
    )

  animation.onfinish = _ =>
    runSlotAnimations(
      animations.slice(1),
      element,
      onFinish
    )
}

const minSeason = 1
const maxSeason = Math.max(...episodes.map(e => e.season))

function clickedSpin() {
  console.log("Clicked spin!")

  const resultSeason = Math.floor(Math.random() * ((maxSeason + 1) - minSeason) + minSeason)
  console.log("Season is going to be " + resultSeason)

  const minEpisode = 1
  const maxEpisode = Math.max(...episodes.filter(e => e.season === resultSeason).map(e => e.episode))

  const resultEpisodeNumber = Math.floor(Math.random() * ((maxEpisode + 1) - minEpisode) + minEpisode)
  console.log("Episode is going to be " + resultEpisodeNumber)

  const resultEpisode = episodes.find((e) => e.season === resultSeason && e.episode === resultEpisodeNumber)
  console.log(episodes.length)

  console.log(resultEpisode)

  const seasonFrames = slotAnimation(1, resultSeason, 1, maxSeason + 1)
  const episodeFrames = slotAnimation(1, resultEpisodeNumber, 1, maxEpisode + 1)

  document.getElementById("spinButton").disabled = true

  runSlotAnimations(
    seasonFrames,
    document.getElementById(seasonReelId),
    () => runSlotAnimations(
      episodeFrames,
      document.getElementById(episodeReelId),
      () => {
        document.getElementById("spinButton").disabled = false

        if (resultEpisode) {
          document.getElementById("episode-title").innerHTML = resultEpisode.title
          document.getElementById("episode-description").innerHTML = resultEpisode.description
        }
      }
    )
  )
}
