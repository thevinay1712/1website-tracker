**Website Change Tracker**
A browser extension that monitors specific sections of any website for changes and sends email alerts and popup notifications when a change is detected.

**Overview**
This project consists of two main parts:

A Browser Extension: Built with JavaScript, this extension allows users to visually select any part of a website they want to track. It periodically fetches the website in the background to check for changes.

A Node.js Backend: A simple Express server designed to be deployed on a service like Render. Its single purpose is to receive alerts from the extension and send an email notification using Nodemailer.

**Key Features**
Visual Element Selector: Simply click on any element on a webpage to start tracking it.

Background Monitoring: The extension uses Chrome's Alarms API to check for changes at user-defined intervals (e.g., every 30 seconds, 10 minutes, 6 hours, etc.).

Email Alerts: Get instant email notifications when the content of the tracked element changes.

Simple Management: A clean popup interface to view, manage, and delete tracked sites.

Efficient Change Detection: It intelligently compares the text content of elements to avoid false alarms from minor HTML attribute changes.

**Tech Stack**
Frontend (Extension): HTML, CSS, JavaScript (Manifest V3)

Backend (Server): Node.js, Express.js

Deployment: Render

Email Service: Nodemailer

**Getting Started**
To get this project up and running, you'll need to deploy the backend server and install the browser extension.

**1. Backend Setup (Deploying to Render)**
The server is responsible for sending email alerts. Deploying it on Render's free tier is a perfect fit for this project.

Fork the Repository: First, fork this GitHub repository to your own GitHub account.

Create a Render Account: Sign up for a free account at Render.com.

Create a New Web Service:

On the Render Dashboard, click "New +" and select "Web Service".

Connect your GitHub account and select the forked repository.

Give your service a unique name (e.g., my-website-tracker).

Configure the Settings:

Root Directory: backend (This tells Render to look inside the backend folder).

Runtime: Node.

Build Command: npm install.

Start Command: node server.js.

Add Environment Variables:

Go to the "Environment" tab for your new service.

Click "Add Environment Variable" and add your email credentials. This will be the email account that sends the notifications.

Key: EMAIL_USER, Value: your-email@gmail.com

Key: EMAIL_PASS, Value: your-gmail-app-password

Important: For Gmail, you must generate an "App Password." Your regular password will not work. Learn how to create an App Password.

Deploy: Click "Create Web Service". Render will automatically build and deploy your server. Once it's live, your server will be available at a public URL like https://your-service-name.onrender.com.

**2. Frontend Setup (Browser Extension)**
Now, you'll install the extension and configure it to communicate with your new Render server.

Clone Your Forked Repository: If you haven't already, clone your forked repository to your local machine.

git clone [https://github.com/your-username/website-tracker.git](https://github.com/your-username/website-tracker.git)
cd website-tracker

Configure the Server URL:

Navigate to the extension folder.

Open the background.js file in a code editor.

Find the handleDetectedChange function at the bottom of the file.

Replace the placeholder URL inside the fetch command with your live Render server URL.

Change this:

await fetch('[https://website-tracker-backend.onrender.com](https://website-tracker-backend.onrender.com)', { 

To this (using your own URL):

await fetch('[https://your-service-name.onrender.com](https://your-service-name.onrender.com)', { 

Load the Extension in Your Browser:

Open your browser (Google Chrome, Microsoft Edge, or Brave).

Navigate to the extensions management page (e.g., chrome://extensions).

Enable "Developer Mode" using the toggle switch.

Click the "Load unpacked" button.

Select the extension folder from your cloned repository.

The "Website Change Tracker" extension will now appear in your extensions list and toolbar.

**How to Use**
Set Your Email: Click the extension icon in your toolbar, enter the email address where you want to receive alerts, and click "Save."

Select an Element:

Navigate to the website you want to monitor.

Click the extension icon and then click the "Add New Site to Track" button.

The page will enter "selection mode." Hover over the page, and elements will be highlighted. Click on the specific section you want to track.

Configure Tracking:

You'll be taken to a configuration page.

Choose the check interval (e.g., "Every 1 min").

Click "Start Tracking".

Done! The extension will now check the site in the background. If a change is detected, your Render server will send an alert to your saved email address.
