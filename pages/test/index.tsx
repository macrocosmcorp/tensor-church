import { useState } from "react"


export default function Home() {
  const [text, setText] = useState(`from manim import *
  from math import *
  import numpy as np
      
  class RootScene(Scene):
      def show_pendulum(self):
          # Define the pendulum parameters
          length = 3
          gravity = 9.8
  
          # Define the starting angle (40 degrees) and initial velocity
          theta = np.radians(40)
          speed = 0
  
          # Create the pendulum's bob and rod
          bob = Dot(point=length*RIGHT)
          rod = Line(ORIGIN, bob.get_center())
          pendulum = VGroup(rod, bob)
  
          # Function to update the pendulum's position each frame
          def update_pendulum(mob, dt):
              nonlocal theta, speed
              # Acceleration
              acceleration = -gravity / length * np.sin(theta)
              # Update speed
              speed += acceleration * dt
              # Update the angle (theta)
              theta += speed * dt
              # Update the positions of rod and bob
              new_bob_position = length * np.sin(theta) * RIGHT + length * np.cos(theta) * DOWN
              mob.become(VGroup(Line(ORIGIN, new_bob_position), Dot(point=new_bob_position)))
  
          # Add the updater to the pendulum and animate
          pendulum.add_updater(update_pendulum)
          self.add(pendulum)
          self.wait(10)  # Let the pendulum swing for 10 seconds
  
      def construct(self):
          # Create the pendulum animation
          self.show_pendulum()`)
  const [result, setResult] = useState('')

  return (
    <div className="w-full max-w-[700px]">
      <textarea className="w-full h-96" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={async () => {
        // Create a Blob from a string
        const codeBlob = new Blob([text], { type: 'text/plain' });

        // Create a new FormData object and append the Blob as a file
        const formData = new FormData();
        formData.append("code", codeBlob, 'test.py');

        // Send the POST request with the Blob as a file
        const res = await fetch("https://runitupturbo-production.up.railway.app/generate_animation_id", {
          method: "POST",
          body: formData,
        });

        const json = await res.json()
        console.log(json)
      }}>Generate</button>
      <div>{JSON.stringify(result).toString()}</div>
    </div>
  )
}