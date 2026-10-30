import Backdrop from "@/components/Backdrop";

export default function NotFound() {
	return (
		<div className="home">
			<Backdrop />
			<main className="layer-content">
				<h1 className="name">404</h1>
				<p className="tagline">Page not found</p>
				<a
					href="/"
					className="button">
					Back to the homepage
				</a>
			</main>
		</div>
	);
}
