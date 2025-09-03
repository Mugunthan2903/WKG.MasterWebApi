function Footer(props) {
    return (<footer className="footer bg-primary wkl-page-footer">
        <div className="container-fluid  bg-primary text-white">
            <div className="row">
                <div className="col-md-6">
                    © We Know Group {new Date().getFullYear()} All Rights Reserved
                </div>
                <div className="col-md-6">
                    <div className="text-md-end footer-links d-none d-md-block">
                        {/* <a href="#">About</a>
                        <a href="#">Support</a>
                        <a href="#">Contact Us</a> */}
                    </div>
                </div>
            </div>
        </div>
    </footer>);
}

export default Footer;