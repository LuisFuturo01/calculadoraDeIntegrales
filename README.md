# Calculus Calculator
#### Video Demo: https://youtu.be/HBfTccDw1Po
#### Description:

# CS 50 - Final Project
I'm a Calculus teacher at Anhanguera College in Belo Horizonte, Minas Gerais, Brazil. Since my undergraduate in Mathematics, I researched Technology, Mathematics, and Education, experimenting with many software such as Wolfram Mathematica, Matlab, Octave, Geogebra, WolframAlpha, PhotoMath, and so on.

When I got my master's degree in Mathematics Education and Technology in 2013 I was researching how students could solve mathematical problems in a group inside a distance learning environment.

I never studied computer science to the depth needed to create an application that could solve some problems of the Calculus classes as derivatives or integrals.

When I started the CS50 course I was already interested in Python programming and especially in how to use Python in Mathematics and Statistics problems.

I found out that the SymPy library had a power of symbolic computation that was similar to other CAS I has experience with, like Wolfram Mathematica for example, so I wanted to try it.

When I started the project my goal was to implement a WebApp that could calculate the derivatives and integrals of a given function and plot its graph. After I lot of learning about the multiple Python libraries and implementing a lot of features, I think that I had fulfilled my goal.

## The libraries and processes

### VS Code
When I started the project I was working only inside the CS50 codespace and had never configured my machine to code independently of the infrastructure of the course.

My first task was to configure Python and its libraries inside my environment of the VS Code IDE. Took a little time and search, but I made it and started to work on my computer outside the CS50 codespace.

### GitHub
I knew that the infrastructure of the CS50 codespace was built up from GitHub, but I had never mangled into what is Git or how GitHub works.

I searched and read about branches, merges, forks, clones, commits, and all the things that I need to start my projects inside GitHub by myself out of the CS50 infrastructure.

### Streamlit
One of my first issues about this project was how I would implement it in a way that worked out of the box for anyone in the world. I didn't want my app live only inside the CS50 infrastructure.

At first, I thought about using Flask + HTML + CSS + JavaScript as the week 9 problems set, but when I found out about StreamLit library I went to it because it seemed easier to work with and had very limited design choices, which is a big problem for me.

So I tried to learn all I could about this library with the documentation and some examples of data science projects deployed into it that helped me to stick to my choice of using it.

One of the best parts of using the streamlit library was that they have its cloud and make it very easy to deploy the projects from GitHub.

The main feature of rendering an HTML + CSS + JavaScript web app from Python-only code was perfect for me. I used these functions:

- st.session_state['input_key']
    - Control the state of the session that the user started so he doesn't lose the information written when the app reruns.
    - Change the value of parameters of some functions without losing all the information.
- st.form
    - I used some forms to input the values because they can collect multiple inputs before sending them to the backend.
    - It made it possible to implement the variable of integration, limits of integration, and range of the interval of values of the plot.
- st.text_input
    - Used to input the texts from the function expression, variable of integration, and limits of integration.
- st.tabs
    - Used to implement a tabs navigation that made the app better to use on mobile devices with small screens.
- st.button
    - Used to implement some buttons that got the information from the answer and took it into the input.
- st.columns
    - Helped to make the visual of the app more consistent in different screen sizes.
- st.latex
    - Used it to print the LaTeX expressions as pretty as they can be to the user.
- st.pyplot
    - Used to plot the figure created by the matplotlib library using the user input.

## SymPy
When I started the project I already knew that SymPy could do the derivatives and integrals that I wanted it to do, but I need to learn how to implement it inside my web app.

So I went online to read the documentation and watched some videos of people using it to do derivatives and integrals, so I could implement it as well. A big problem that emerged was the very strict syntax that this library used, so I went to look for a solution for it.

Looking up I found the parsing functions of the library that made it possible to write the input in a lossy syntax and be understood by the sympy even though.

Functions used in SymPy
sympy.parsing.sympy_parser
Made possible to parse many ways to write a function into a syntax that sympy could compute.
- sp.latex
    - Converts the sympy outputs into LaTeX code to be printed pretty in the browser using the KaTeX library from JavaScript.
- sp.diff
    - Takes the derivative of a function with respect to a variable.
- sp.integrate
    - Returns the antiderivative or integral of a function
- sp.Integral
    - Writes the integral of a function without evaluating it.
- sp.lambdify(x, function_parsed, "numpy")
    - An incredible function that turns a symbolic function in sympy into a numeric function in the numpy library.

## NumPy
When the project started I knew that there was a very popular Python library to work with numerical computation, but I thought I wouldn't need to use it because all my computation would be symbolic. I was wrong.

NumPy was needed to create the lists of values to be plotted by the matplotlib. So the only two functions that I used with NumPy were:
- np.linspace
    - Creates a list of numbers spaced linearly inside an interval of values. Used it to create the x_values of the plot
- sp.lambdify(x, function_parsed, "numpy")
    - Creates a numpy function from the sympy symbolic expression.
    - Used to create the y_values of the plot

## Matplotlib
When I was studying sympy I found the SymPy plot function and thought that it would be all that I needed to plot my functions, but its implementations were erratic.

I ended up using NumPy and Matplotlib instead of the plot function of sympy.

Functions used to plot with matplotlib:
- plt.subplots()
    - Defines the figure and the axes to be plotted
- ax.plot
    - Given a list of values of x and y it plots a line that connects all of them
- ax.set
    - Set the labels of the axis
- ax.grid()
    - Make use of the grid in the plot.


## These are some features that I thought would be great for the app:

- A WebApp that can be accessed via mobile.
- Get the input from the user in a way that is natural to me.
- Show some results about this function
- The LaTeX rendering
    - The user should be able to see it as if it was written by hand.
    - Would be great to be able to download the rendered image of the function. (NOT DONE)
    - It would be even greater if it was possible to share the page with someone else using the URL. (NOT DONE)
- Plot the function
    - The user must get a plot to check the function behavior.
    - It would be good if the user could download the image of the plot to share and use elsewhere.
    - Would be good the let the user change the viewport of the canvas for the plot of the function and get more options.
- Derivative
    - Show the derivative of the function given
    - Would be good if when the user could use as input the solution of the derivative.
    - It would be good if the user could download the LaTeX rendering. (NOT DONE)
- Integral
    - Show the antiderivative of the function
    - Download the LaTeX and the rendering. (NOT DONE)
    - Calculate the defined integral with the upper and lower limits.

# Script for the video that presents the app
Hi, I’m Felipe Heitmann from Belo Horizonte, Brazil and this is CS50.

My final project is a Calculus Calculator

Having had a hard time checking your derivatives and integrals by hand?

Let’s check out my Calculus Calculator.

In this web app, you can write a function the way you like, and the app is going to present you with what it understands from your input.

For example 2sin(x) + cos(2x)

Or you can write it without the parenthesis and the asterisk, it will understand it as well.

If what you see is what you wanted to input you can go and check the derivative tab.

In this tab, you are going to see the derivative of this function with respect to the variable x, and if you want to use this derivative as new input, just click this button.

Now it shows the derivative of the derivative or the second derivative of the original input function

You can go to the next tab where you’re going to find the integrals of these functions.

The first thing you will notice is the indefinite integral or the antiderivative of the input function.

And again, if you want to use this result as new input, just click this button.

But inside the form below you can see the definite integral with respect to x from 0 to 1.

Here you can change the variable of the integral and the upper and lower limits.

They accept numbers and constants as well as other expressions like functions for example.

When you go to the plot tab you’re going to find a plot of the input function where x goes from -10 to 10.

This plot will present the function in a way you can see all of its points inside this interval of values of x.

It compresses or stretches the ratio between x and y to present you with the behavior of the function inside the interval.

You can change the values of the interval presented in this plot using the form below it.


## Timeline of the development
- WebApp working
    - Set up my VS Code with Python
        - Download and Install Python 3.10
        - Install Python extension in VS Code
        - Download and Install GIT
        - Test some programs in Python
        - Installed spell checker on vs code.
    - Setup GitHub
        - Create a new repository for the project
        - Cloned the repository to my machine
        - Configured the git with my GitHub account.
        - Opened the README.md and started writing about my project
    - Setup Streamlit
        - Install streamlit
        - Run the get started
        - Create the first app.py
        - Create an account at streamlit cloud
        - Deploy the first app
    - Input from the user
        - Test the options for the input of text
        - Working with sessions to keep info when re-run
    - LaTeX render
        - Render LaTeX with st.latex() from the input
        - Configure sympy
        - Configure the parser
        - Derivatives OK
        - Integrals OK
    - Plotting functions
        - Implement sympy.plot
            - It was not great.
        - Tried a lot of ways to make it better, but I gave up for now
    - Make it better for mobile
        - Tried to create a help keyboard but was difficult
        - Ended using a for to write the function input
        - Explored the expanders and tabs for better usability
        - Ended up using the tabs.
    - Back to plotting
        - Now I understood the function lambdfy to parse from sympy to numpy
        - Used linespace to create the x_values and lambdfy to create the y values
        - Implemented the change of values of x in the plot
    - Integration
        - Implemented the defined integral using a lot of parsing
