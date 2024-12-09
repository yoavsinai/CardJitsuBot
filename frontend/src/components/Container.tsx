export const Container = ({ id, children }: { id: string; children: any }) => (
    <>
        <div className="filler" id={id}></div>
        <div className="parent">{children}</div>
    </>
);
