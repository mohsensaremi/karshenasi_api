import 'bootstrap';
import fakeData from '../fakeData';
import User, {UserType} from '../src/app/models/User';
import Course from '../src/app/models/Course';
import Post, {PostType} from '../src/app/models/Post';
import bcrypt from 'bcrypt';

async function main() {
    const userPromises = fakeData.instructors.map(async (data) => {
        const user = new User({
            ...data,
            type: UserType.instructor,
            password: bcrypt.hashSync("123546", 10),
        });
        await user.save();
        const coursePromises = data.courses.map(async data => {
            const course = new Course({
                ...data,
                userId: user._id,
            });
            await course.save();

            const postPromises = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(async x => {
                const post = new Post({
                    title: `لورم ایپسوم متن ساختگی با تولید سادگی ${x}`,
                    content: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد. در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها و شرایط سخت تایپ به پایان رسد وزمان مورد نیاز شامل حروفچینی دستاوردهای اصلی و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.",
                    userId: user._id,
                    courseId: course._id,
                    type: PostType.alert,
                });
                await post.save();
            });
            await Promise.all(postPromises);
        });
        await Promise.all(coursePromises);
    });
    await Promise.all(userPromises);
}

main().then(() => {
    console.log("DONE");
}).catch(err => {
    console.log("E", err.message);
});