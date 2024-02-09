import LinkButton from '../LinkButton';
import './styles.css';
const ContactSection = () => {
  return (
    <footer className="contact">
      <div className="content">
        <h2>Hi, Let us talk business </h2>
        <p>
          I am confident that I have the knowledge and experience needed to
          contribute to any team in the fastest time possible. i will constantly
          seek to add value in my work to help your company . <br />
          <br />I am available for a call at short notice and can be contacted
          via any of the details below. Thank you.
        </p>
        <div className="contact-info">
          <LinkButton
            to="https://adeltadjerouni.com/resume-v5.1.5.pdf"
            download
            label="Download my resume"
            width="medium"
            leftIcon="bx-file-find"
          />
          <span>Or</span>
          <ul>
            <li>
              <a
                href="mailto:mohnagato@gmail.com"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bx bxl-gmail"></i>
              </a>
            </li>
            <li>
              <a
                rel="noreferrer"
                href="https://www.linkedin.com/in/adel-mohamed-tadjerouni"
                target="_blank"
              >
                <i className="bx bxl-linkedin" />
              </a>
            </li>

            <li>
              <a
                href="https://github.com/TadjerouniMohamedAdel"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bx bxl-github" />
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/TadjerouniAdel"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bx bxl-twitter" />
              </a>
            </li>
            <li>
              <a
                href="https://join.skype.com/invite/afq6nmhgxMgr"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bx bxl-skype" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="imgBox">
        <img src="/images/contact.png" alt="" />
        <div className="purple-square"></div>
        <div className="orange-square"></div>
        <div className="gray-square"></div>
        <div className="red-circle"></div>
      </div>
    </footer>
  );
};

export default ContactSection;
