interface DisclaimerPlacardProps {
  id: string
  agreed: boolean
  nudge: boolean
  onAgreeChange: (agreed: boolean) => void
}

function DisclaimerPlacard({ id, agreed, nudge, onAgreeChange }: DisclaimerPlacardProps) {
  return (
    <div className="placard" id={id}>
      <span className="placard__screw placard__screw--tl" />
      <span className="placard__screw placard__screw--tr" />
      <span className="placard__screw placard__screw--bl" />
      <span className="placard__screw placard__screw--br" />
      <div className="placard__title">NOTICE TO GUESTS</div>
      <p>
        You are uploading an image to a random website. I don't save it and I don't want it. It
        may not even get used. But this is on you.
      </p>
      <p>This is made with AI. I don't like it, but that's how it is.</p>
      <label className="placard__agree">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreeChange(e.target.checked)}
        />
        <span>Understood. This one's on me.</span>
      </label>
      {nudge && !agreed && (
        <div className="placard__nudge" role="alert">
          Read the notice and tick the box first.
        </div>
      )}
    </div>
  )
}

export default DisclaimerPlacard
