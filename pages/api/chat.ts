import { type ChatGPTMessage } from "../../components/ChatLine";

const system_message: ChatGPTMessage = {
    role: "system",
    content: `You are an expert AI graphic designer and illustrator who specializes in animating very short graphical explainers for educational concepts. You're tasked with helping a user turn a given high-level idea for an animation into a detailed step-by-step description that can be used to create a video.

    Given a simple one sentence user prompt, respond with a bullet point list of a simple and informative animation that covers the relevant topic. Be specific in the labels, charts, lines, or text that would need to show up on screen.
    
    The animation itself should never be longer than a couple seconds, so make sure to include too many consecutive scenes. Assume the animator who will produce your ideas will use a library like Manim, which only support very simple operations and is only support a handful of elements rendered.
    
    Do not be overly descriptive, be concise and clear about examples. Example: 
    
    Request: "Design a very simple animation that showed how a dot product works using vectors. Use the fact that you project one vector onto the other, then multiply the magnitude of those vectors."
    
    Response: "A brief animation demonstrating the dot product of two vectors using projection. Begin with a 2D Cartesian coordinate system where two vectors, a and b, originate from the origin (0,0). Next, visualize the projection of vector a onto vector b to form a right triangle with b and the projection. Then, animate a brief flash to highlight the projected component and the perpendicular component separately. Simultaneously, depict the angle theta between the vectors dynamically changing, while visually representing the cosine of the angle through the changing angle of the triangle formed. Lastly, illustrate the dot product formula "a dot b = |a| x |b| x cos(theta)" where the lengths of vectors and the cosine of the angle dynamically change to match the visual representation."`
}

const create_animation = () => {
  return {
    name: `create_animation`,
    description: `Creates a simple Manim animation from a text description.`,
    parameters: {
      type: "object",
      properties: {
        instructions: {
          type: "string",
          description: `A string containing the instructions for the animation.`,
        },
      },
      required: ["instructions"],
    },
  }
}

// const edit_animation = () => {
//   return {
//     name: `edit_animation`,
//     description: `Creates a simple Manim animation from a text description.`,
//     parameters: {
//       type: "object",
//       properties: {
//         instructions: {
//           type: "string",
//           description: `A string containing the instructions for the animation.`,
//         },
//       },
//       required: ["instructions"],
//     },
//   }
// }


// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge",
};

const requestHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
};

if (process.env.OPENAI_API_ORG) {
  requestHeaders["OpenAI-Organization"] = process.env.OPENAI_API_ORG;
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json();

  console.log("body", body);

  if (!body?.messages) {
    return new Response("Missing body", { status: 400 });
  }

  const messages: ChatGPTMessage[] = [];
  messages.push(system_message)
  messages.push(...body?.messages);

  console.log("messages", messages.map(x => x.content));

  let result_messages = await get_response(messages);
  if (!result_messages) {
    return new Response("OpenAI API Error", { status: 500 });
  }

  console.log("result_messages", result_messages.map(x => x.content));

  // let output = result_messages.filter(x => x.role == "assistant" || x.role == "user")

  return new Response(JSON.stringify(result_messages), { status: 200 });
};
export default handler;

const payload_template = {
  model: "gpt-4",
  function_call: "auto",
};

type TheFunctions = 'create_animation'

const function_list: Record<TheFunctions, string> = {
  'create_animation': 'https://bible.religions.chat/search',
}

async function get_response(messages: ChatGPTMessage[]): Promise<ChatGPTMessage[] | null> {
  let payload = { ...payload_template, messages, functions: [create_animation()] };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: requestHeaders,
    method: "POST",
    body: JSON.stringify(payload),
  });


  if (res.status !== 200) {
    console.log("openai error:", res.status, res.statusText, await res.text(), process.env.OPENAI_API_KEY);
    return null
  }

  let json = await res.json();
  let message = json?.choices[0].message;

  console.log("res", res.status, res.statusText, message, json);

  if (message.function_call) {
    console.log("function_call", message.function_call);
    let function_name: TheFunctions = message.function_call.name;
    let function_args = JSON.parse(message.function_call.arguments);

    // call function and get result TheFunctions
    if (function_name != "create_animation") {
      console.log("error: unknown function", function_name);
      return null
    }

    if (!function_args.instructions) {
      console.log("error: missing query");
      return null
    }

    let codeObj = await render_description(function_args.instructions)
    console.log("codeObj", codeObj);

    // Strip ```python and ``` from code
    if (!codeObj || !codeObj.content.includes("```python")) {
      console.log("error: missing code");
      return null
    }

    let code = codeObj?.content;

    console.log("code", code);
    
    code = code.replace(/```python/g, "");
    code = code.replace(/```/g, "");

    // Run code on server, Notes from co-worker:
    //     curl --request POST \
    //   --url https://runitupturbo-production.up.railway.app/generate_animation_id \
    //   --header 'content-type: multipart/form-data' \
    //   --form code=@/Users/sdan/Developer/chatwithanimator/test.py
    // import requests
    // url = "https://runitupturbo-production.up.railway.app/generate_animation_id"
    // payload = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"code\"; filename=\"test.py\"\r\n\r\n\r\n-----011000010111000001101001--\r\n"
    // headers = {"content-type": "multipart/form-data; boundary=---011000010111000001101001"}
    // response = requests.request("POST", url, data=payload, headers=headers)
    // print(response.text)
    // you can call https://runitupturbo-production.up.railway.app/generate_animation instead not have the id returned and just have the mp4 returned

    // Create a Blob from a string
    const codeBlob = new Blob([code], { type: 'text/plain' });

    // Create a new FormData object and append the Blob as a file
    const formData = new FormData();
    formData.append("code", codeBlob, 'test.py');

    // Send the POST request with the Blob as a file
    const res = await fetch("https://runitupturbo-production.up.railway.app/generate_animation_id", {
      method: "POST",
      body: formData,
    });

    // Log the response
    console.log(await res.text());


    if (res.status !== 200) {
      console.log("runitupturbo error:", res.status, res.statusText, await res.text());
      return null
    }

    let animation_id = await res.text();
    console.log("runitupturbo", res.status, res.statusText, animation_id);


    // add to conversation
    messages.push({
      role: "function",
      name: function_name,
      content: animation_id
    });
    return messages
  }

  messages.push(message);

  return messages
}

async function render_description(description: string) {

  console.log("description", description);
  // Use fewShotRenderer to render the description
  const messages = fewShotRenderer
  messages.push({
    "role": "user",
    "content": description,
  })
  
  console.log("messages", messages.map(x => x.content));
  const payload = {  model: "gpt-4", messages };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: requestHeaders,
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (res.status !== 200) {
    console.log("openai error:", res.status, res.statusText, await res.text());
    return null
  }

  let json = await res.json();
  let message = json?.choices[0].message;
  return message
}

const fewShotRenderer = [
  {
    "role": "system",
    "content": "You are an expert professor who specializes in creating short animations to help students understand educational content. All of your animations are carefully and correctly designed to be intuitive, simple, and free of any errors.\n\nYou write Manim scripts for animations in Python based on the provided instructions. Do not return anything except for the correct Manim scene code snippet. Start immediately with ```python and end immediately after.\n\nYou must always be formatted correctly in exactly the same format as the below code snippet. Create scene functions and call them all from the RootScene with the self object as input. Always include manim, math, and numpy but never additional packages.\n\n```python\nfrom manim import *\nfrom math import *\nimport numpy as np\n\nclass RootScene(Scene):\n    def show_square(self):\n        # Define the elements of your scene\n        square = Square()\n\n        # Add animation to your scene\n        self.play(Create(square))\n\n    def show_circle(self):\n        # Define the elements of your scene\n        circle = Circle()\n\n        # Add animation to your scene\n        self.play(Create(circle))\n\n        # All other scene functions\n\n    def construct(self):\n        # First part of the video\n        self.show_square()\n\n        # Second part of the video\n        self.show_circle()\n\n        # All other scenes, etc.\n```\n\nBugs to look out for:\n- Make sure to convert np.int64 or other objects into strings before displaying.\n- Remember that Matrix() requires a 2D array."
  },
  {
    "role": "user",
    "content": "Animate a single pendulum swinging."
  },
  {
    "role": "assistant",
    "content": "```python\nfrom manim import *\nfrom math import *\nimport numpy as np\n    \nclass RootScene(Scene):\n    def show_pendulum(self):\n        # Define the pendulum parameters\n        length = 3\n        gravity = 9.8\n\n        # Define the starting angle (40 degrees) and initial velocity\n        theta = np.radians(40)\n        speed = 0\n\n        # Create the pendulum'\''s bob and rod\n        bob = Dot(point=length*RIGHT)\n        rod = Line(ORIGIN, bob.get_center())\n        pendulum = VGroup(rod, bob)\n\n        # Function to update the pendulum'\''s position each frame\n        def update_pendulum(mob, dt):\n            nonlocal theta, speed\n            # Acceleration\n            acceleration = -gravity / length * np.sin(theta)\n            # Update speed\n            speed += acceleration * dt\n            # Update the angle (theta)\n            theta += speed * dt\n            # Update the positions of rod and bob\n            new_bob_position = length * np.sin(theta) * RIGHT + length * np.cos(theta) * DOWN\n            mob.become(VGroup(Line(ORIGIN, new_bob_position), Dot(point=new_bob_position)))\n\n        # Add the updater to the pendulum and animate\n        pendulum.add_updater(update_pendulum)\n        self.add(pendulum)\n        self.wait(10)  # Let the pendulum swing for 10 seconds\n\n    def construct(self):\n        # Create the pendulum animation\n        self.show_pendulum()\n```"
  },
  {
    "role": "user",
    "content": "Animate a simple matrix multiplication."
  },
  {
    "role": "assistant",
    "content": "```python\nfrom manim import *\nfrom math import *\nimport numpy as np\n    \nclass RootScene(Scene):\n    def show_matrix_multiplication(self):\n        # Define data for matrices\n        data1 = [\n            [1, 2],\n            [3, 4]\n        ]\n        data2 = [\n            [5, 6],\n            [7, 8]\n        ]\n\n        # Create matrices\n        matrix1 = Matrix(data1)\n        matrix2 = Matrix(data2)\n\n        # Position\n        matrix1.shift(3*LEFT)\n        matrix2.next_to(matrix1, RIGHT)\n\n        # Create matrices on the scene\n        self.play(Create(matrix1), Create(matrix2))\n        self.wait()\n        \n        # Create text\n        equals = MathTex(\"=\").next_to(matrix2, RIGHT)\n\n        # Create result matrix\n        result_data = np.dot(data1, data2)\n        result_matrix = Matrix(result_data)\n        result_matrix.next_to(equals)\n\n        # Show result\n        self.play(Create(equals), Create(result_matrix))\n        self.wait(2)\n\n    def construct(self):\n        self.show_matrix_multiplication()```"
  },
]