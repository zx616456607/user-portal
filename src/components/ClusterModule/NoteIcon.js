
import "./style/NoteIcon.less"
import React from "react"

export default function NoteIcon({title, hidden = false}) {
  return(
    <div className="NoteIcon" style={{ visibility: hidden ? "hidden":"initial" }}>
      <div className="parallelogram1"></div>
      <div className="parallelogram"></div>
      <div className="title">{title}</div>
    </div>
  )
}